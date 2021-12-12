const Joi = require("@hapi/joi");
const Bcrypt = require("bcrypt");
const https = require("https");
const querystring = require("querystring");
const { v4: uuidv4 } = require("uuid");
const JWT = require("jsonwebtoken");

const passwordHash =
  "$2b$10$9hsgRVDD3ZeOa2S97RYVzOmoY3LJctNw8rOcwUqmUd5vPo8hEXJHO";
//2b10y7UnPTFBszk2dq0xXdJDC.mdtjq2QlBPezcLHeVxRFgFQQOXkC1bK

const secret_key = "Z73UWm85x2W4UB7Jz386cqyCST5fT97g";
// const secret_key = "47k6YS36TC26kGpENUF7QF7yZtSnamPV";

const validAuth = () => {
  return Joi.string()
    .required()
    .custom((value, helpers) => {
      if (Bcrypt.compareSync(value, passwordHash)) return value;
      throw new Error("hackers, go away!");
    });
};

// const httpConfig = {
//   host: "ec2-54-236-41-218.compute-1.amazonaws.com",
//   http: { port: 3000 },
//   https: { port: 3001 },
// };

const init = async () => {
  const knex = require("knex")({
    client: "pg",
    debug: false,
    connection: {
      host: "localhost",
      user: "postgres",
      password: "postgres",
      database: "main",
    },
    debug: true,
  });

  const validate = async function (decoded, request, h) {
    // do your checks to see if the person is valid
    if (
      !(await knex("user").select("*").where({
        id: decoded.id,
        username: decoded.username,
      }))
    ) {
      return { isValid: false };
    } else {
      return { isValid: true };
    }
  };

  const server = require("@hapi/hapi").server({
    port: 3001,
    host: "0.0.0.0",
    routes: {
      cors: true,
    },
  });

  await server.register(require("hapi-auth-jwt2"));

  server.auth.strategy("jwt", "jwt", {
    key: passwordHash, // Never Share your secret key
    validate, // validate function defined above
  });

  server.auth.default("jwt");

  // Login
  server.route({
    method: "POST",
    path: "/login",
    config: { auth: false },
    handler: async (request, h) => {
      const schema = Joi.object({
        auth: Joi.string()
          .required()
          .custom((value, helpers) => {
            if (Bcrypt.compareSync(value, passwordHash)) return value;
            throw new Error("hackers, go away!");
          }),

        username: Joi.string().required(),
        password: Joi.string().required(),
      });

      const valid = schema.validate(request.payload);
      if (valid.error) return valid.error.details;

      const user = await knex("user").select("*").where({
        username: valid.value.username,
        password: valid.value.password,
      });

      console.log(user[0]);
      if (user) {
        const token = JWT.sign(
          {
            username: user[0].username,
            id: user[0].id,
          },
          passwordHash
        );
        return {
          status: true,
          name: user[0].login,
          id: user[0].id,
          username: user[0].username,
          token: token,
        };
      } else {
        return {
          status: false,
          message: "Credential doesn't correct!",
        };
      }
    },
  });

  // Get all patients
  server.route({
    method: "GET",
    path: "/patients",
    config: { auth: "jwt" },
    handler: async (request, h) => {
      const schema = Joi.object({
        auth: validAuth,
      });

      const valid = schema.validate(request.query);
      if (valid.error) return valid.error.details;
      return await knex("patient").select("*").orderBy("created", "desc"); //TODO where user_id
    },
  });

  // Get single patient
  server.route({
    method: "GET",
    path: "/patients/{ID}",
    config: { auth: "jwt" },
    handler: async (request, h) => {
      const schema = Joi.object({
        auth: validAuth,
      });

      const valid = schema.validate(request.query);
      if (valid.error) return valid.error.details;
      const ID = request.params.ID;
      return await knex("patient").select("*").where("id", ID); //TODO where user_id
    },
  });

  //* temporary **/
  server.route({
    method: "GET",
    path: "/dpatients",
    handler: async (request, h) => {
      return await knex("patient").del();
    },
  });

  // Get transactions
  server.route({
    method: "GET",
    path: "/tx",
    config: { auth: "jwt" },
    handler: async (request, h) => {
      const schema = Joi.object({
        auth: validAuth,
        patient_id: Joi.number().integer().optional(),
      });

      const valid = schema.validate(request.query);
      if (valid.error) return valid.error.details;

      // get transaction query from NMI

      const hostName = "secure.networkmerchants.com";
      const path = "/api/query.php";

      let requestOptions = {
        security_key: secret_key,
        action_type: "refund",
        // transaction_type: "cc",
      };

      var postData = querystring.stringify(requestOptions);

      const options = {
        hostname: hostName,
        path: path,
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(postData),
        },
      };

      let result = await sendRequestPost(options, postData);
      const { status, res } = result;

      // const parseResult = await parseXML(res);
      // parseResult.nm_response.transaction.forEach(async (element) => {
      //   console.log(
      //     "------------------------------",
      //     element.transaction_id[0],
      //     element.customerid[0],
      //     element.action[0].action_type[0]
      //   );
      // });

      if (status) {
        const parseResult = await parseXML(res);
        if (parseResult.nm_response && parseResult.nm_response.transaction) {
          for (
            let index = 0;
            index < parseResult.nm_response.transaction.length;
            index++
          ) {
            const element = parseResult.nm_response.transaction[index];
            var where_2 = {};
            where_2.tx_id = element.original_transaction_id[0] || -1;
            where_2.approved = 1;
            var transaction_id = await knex("tx").where(where_2).select("id");
            transaction_id = transaction_id.map((item) => {
              return item.id;
            });

            if (transaction_id[0]) {
              if (element.action[0].action_type[0] == "refund") {
                console.log("transaction id:", transaction_id[0]);

                var where_3 = {};
                where_3.id = transaction_id[0] || -1;

                await knex("tx")
                  .where(where_3)
                  .update({
                    type: "linkedRefund",
                    tx_linked: element.transaction_id[0] || 0,
                  })
                  .then((rows) => {
                    if (!rows) {
                      console.log("update false:");
                    }
                    console.log("update success:", where_3, rows);
                  })
                  .catch((e) => {
                    console.log(e);
                  });
              } else if (element.action[0].action_type[0] != "sale") {
                await knex("tx")
                  .where(where_3)
                  .update({
                    type: element.action[0].action_type[0],
                    tx_linked: element.transaction_id[0] || null,
                  });
              }
            }
          }
        }
      }

      //-------------------------------------------------------------------------------------

      let where = {};
      //TODO and where user_id
      if (valid.value.patient_id) where.patient_id = valid.value.patient_id;

      let items = await knex({ t: "tx" })
        .select(
          "t.*",
          knex.raw(`concat(p.first_name, ' ', p.last_name) as patient_name`)
        )
        .leftJoin({ p: "patient" }, "t.patient_id", "p.id")
        .where(where)
        .orderBy("created", "desc");

      // get last available void date
      const voidDeadline = new Date();
      voidDeadline.setHours(0, 0, 0, 0);

      // aggregate refund logic and inter-transaction links
      items = items.map((item) => {
        item.patient_name = item.patient_name.trim();
        item.refund_method = false;
        item.refundable_amount = 0;

        if (item.type === "sale" && item.approved) {
          // first - is it already refunded?
          const alreadyRefundedAmount = items.reduce((amount, tx) => {
            if (tx.tx_linked === item.tx_id && tx.approved) {
              amount += tx.amount;
            }
            return amount;
          }, 0);
          item.refundable_amount = item.amount - alreadyRefundedAmount;

          // second: detect refund variant
          if (item.refundable_amount) {
            if (new Date(item.created) > voidDeadline) {
              item.refund_method = "void";
            } else {
              item.refund_method = "linkedRefund";
            }
          } else {
            item.refund_method = "refunded";
          }
        }

        if (item.type === "auth" && item.approved) {
          // allow to make unhold
          const isAlreadyReleased = items.find((tx) => {
            return tx.tx_linked === item.tx_id && tx.approved;
          });
          if (!isAlreadyReleased) {
            item.refund_method = "authRelease";
          } else {
            item.refund_method = "released";
          }
        }
        return item;
      });

      return items;
    },
  });

  // Get Card Infos
  server.route({
    method: "GET",
    path: "/card",
    config: { auth: "jwt" },
    handler: async (request, h) => {
      const schema = Joi.object({
        auth: validAuth,
        patient_id: Joi.number().integer().optional(),
      });

      const valid = schema.validate(request.query);
      if (valid.error) return valid.error.details;

      let where = {};
      //TODO and where user_id
      if (valid.value.patient_id) where.patient_id = valid.value.patient_id;

      let items = await knex({ t: "card" })
        .select(
          "t.*",
          knex.raw(`concat(p.first_name, ' ', p.last_name) as patient_name`)
        )
        .leftJoin({ p: "patient" }, "t.patient_id", "p.id")
        .where(where)
        .orderBy("created", "desc");

      return items;
    },
  });

  // Add new card
  server.route({
    method: "POST",
    path: "/add_card",
    config: { auth: "jwt" },
    handler: async (request, h) => {
      const schema = Joi.object({
        auth: Joi.string()
          .required()
          .custom((value, helpers) => {
            if (Bcrypt.compareSync(value, passwordHash)) return value;
            throw new Error("hackers, go away!");
          }),
        card_token: Joi.string().required().min(12).max(25),
        card_exp: Joi.string().required().min(4).max(4),
        card_cvc: Joi.string().required().min(3).max(3),

        user_id: Joi.number().integer().required(),
        patient_id: Joi.number().integer().required(),
        customer_vault_id: Joi.string().required(),
        // billing address & etc

        card_address: Joi.string().optional(),
        card_city: Joi.string().optional(),
        card_state: Joi.string().optional(),
        card_zip: Joi.string().optional(),
      });

      const valid = schema.validate(request.payload);
      if (valid.error) return valid.error.details;

      const hostName = "secure.nmi.com";
      const path = "/api/transact.php";

      const billing_id = Date.now();

      let requestOptions = {
        customer_vault: "add_billing",
        customer_vault_id: valid.value.customer_vault_id,
        security_key: secret_key,
        ccnumber: valid.value.card_token,
        ccexp: valid.value.card_exp,
        cvv: valid.value.card_cvc,
        address1: valid.value.card_address,
        city: valid.value.card_city,
        state: valid.value.card_state,
        zip: valid.value.card_zip,
        billing_id: billing_id,
      };

      postData = querystring.stringify(requestOptions);

      const options = {
        hostname: hostName,
        path: path,
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(postData),
        },
      };

      let result = await sendRequestPost(options, postData);
      // console.log(result);
      const { status, res } = result;

      var parsed_res = querystring.parse(res);

      if (status && parsed_res.response == 1) {
        card_id_arr = await knex("card")
          .returning("id")
          .insert({
            card_token: panMask(valid.value.card_token),
            card_exp: valid.value.card_exp,
            user_id: valid.value.user_id,
            patient_id: valid.value.patient_id,
            card_address: valid.value.card_address,
            card_city: valid.value.card_city,
            card_state: valid.value.card_state,
            card_zip: valid.value.card_zip,
            billing_id: billing_id,
            created: new Date(),
          });

        return {
          status: true,
          card_id: card_id_arr.pop(),
        };
      } else {
        return {
          status: false,
          message: parsed_res.responsetext,
        };
      }
    },
  });

  // Remove card
  server.route({
    method: "GET",
    path: "/remove_card/{ID}",
    config: { auth: "jwt" },
    handler: async (request, h) => {
      const schema = Joi.object({
        auth: validAuth,
      });

      const valid = schema.validate(request.query);
      if (valid.error) return valid.error.details;
      const ID = request.params.ID;
      let where = {};
      //TODO and where user_id
      where["t.id"] = ID;
      const card_info = await knex({ t: "card" })
        .select("t.*", "p.customer_vault_id")
        .leftJoin({ p: "patient" }, "t.patient_id", "p.id")
        .where(where);

      console.log(card_info[0]);
      const hostName = "secure.nmi.com";
      const path = "/api/transact.php";

      let requestOptions = {
        customer_vault: "delete_billing",
        customer_vault_id: card_info[0].customer_vault_id,
        security_key: secret_key,
        billing_id: card_info[0].billing_id,
      };

      postData = querystring.stringify(requestOptions);

      const options = {
        hostname: hostName,
        path: path,
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(postData),
        },
      };

      let result = await sendRequestPost(options, postData);
      const { status, res } = result;

      var parsed_res = querystring.parse(res);
      if (status && parsed_res.response == 1) {
        return {
          status: true,
          result: await knex("card").returning("id").where("id", ID).del(),
        };
      } else {
        return {
          status: false,
          message: parsed_res.responsetext,
        };
      }
      // return await knex("card").returning("id").where("id", ID).del(); //TODO where user_id
    },
  });

  // Make transactions
  server.route({
    method: "POST",
    path: "/tx",
    config: { auth: "jwt" },
    handler: async (request, h) => {
      const schema = Joi.object({
        auth: validAuth,
        patient_id: Joi.number().integer().required(),
        user_id: Joi.number().integer().required(),
        tx_id: Joi.string().required(),
        tx_linked: Joi.string().allow("", null),
        timestamp: Joi.number().optional(),
        type: Joi.string().required(),
        amount: Joi.number().required(),
        approved: Joi.number().valid(0, 1),
        meta: Joi.string().optional(),
      });

      const valid = schema.validate(request.payload);
      if (valid.error) return valid.error.details;

      try {
        const isOk = await knex("tx").insert({
          patient_id: valid.value.patient_id,
          user_id: valid.value.user_id,
          tx_id: valid.value.tx_id,
          tx_linked: valid.value.tx_linked,
          timestamp: new Date(valid.value.timestamp || Date.now()),
          type: valid.value.type,
          amount: valid.value.amount,
          approved: valid.value.approved,
          meta: valid.value.meta,
          created: new Date(),
        });

        console.log("tx insert success", isOk.rowCount);
        return 200;
      } catch (e) {
        console.warn("tx knex failed", e);
        return 400;
      }
    },
  });

  // Terminal Payment
  server.route({
    method: "POST",
    path: "/terminal_payment",
    config: { auth: "jwt" },
    handler: async (request, h) => {
      const schema = Joi.object({
        auth: Joi.string()
          .required()
          .custom((value, helpers) => {
            if (Bcrypt.compareSync(value, passwordHash)) return value;
            throw new Error("hackers, go away!");
          }),
        type: Joi.string().required(),
        amount: Joi.string().required(),
      });

      const valid = schema.validate(request.payload);
      if (valid.error) return valid.error.details;

      //MNI API Integration

      const hostName = "secure.nmi.com";
      const path = "/api/v2/devices/list";

      const options = {
        hostname: hostName,
        path: path,
        method: "GET",
        headers: {
          Authorization: `Bearer ${secret_key}`,
          "Content-Type": "application/json",
        },
      };

      let result = await sendRequestGet(options);
      const { status, res } = result;
      var devices = JSON.parse(res).poiDevices;
      var device = {};

      if (status) {
        devices.forEach((element) => {
          if (element.registrationStatus == "registered") {
            device = element;
          }
        });
        if (device == {}) {
          return { status: false, message: "Registered Device does't exist" };
        } else {
          console.log(device);
          const hostName = "secure.nmi.com";
          const path = "/api/transact.php";

          const requestOptions = {
            security_key: secret_key,
            poi_device_id: device.deviceId,
            amount: valid.value.amount,
            type: valid.value.type,
          };

          const postData = querystring.stringify(requestOptions);

          const options = {
            hostname: hostName,
            path: path,
            method: "POST",
            headers: {
              Authorization: `Bearer ${secret_key}`,
              "Content-Type": "application/x-www-form-urlencoded",
              "Content-Length": Buffer.byteLength(postData),
            },
          };

          let result = await sendRequestPost(options, postData);
          const { status, res } = result;
          const res_data = querystring.parse(res);

          if (status) {
            if (res_data.response == 1) {
              return { status: true, message: res_data.responsetext };
            } else {
              return { status: false, message: res_data.responsetext };
            }
          } else {
            return { status: false, message: querystring.parse(res).message };
          }
        }
      } else {
        return { status: false, message: "Can't find devices" };
      }
    },
  });

  // Refund payment
  server.route({
    method: "POST",
    path: "/refund_payment",
    config: { auth: "jwt" },
    handler: async (request, h) => {
      const schema = Joi.object({
        auth: Joi.string()
          .required()
          .custom((value, helpers) => {
            if (Bcrypt.compareSync(value, passwordHash)) return value;
            throw new Error("hackers, go away!");
          }),
        transactionid: Joi.string().required(),
      });

      const valid = schema.validate(request.payload);
      if (valid.error) return valid.error.details;

      //MNI API Integration

      const hostName = "secure.networkmerchants.com";
      const path = "/api/transact.php";

      let requestOptions = {
        type: "refund",
        security_key: secret_key,
        transactionid: valid.value.transactionid,
      };

      postData = querystring.stringify(requestOptions);

      const options = {
        hostname: hostName,
        path: path,
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(postData),
        },
      };

      let result = await sendRequestPost(options, postData);
      const { status, res } = result;
      const res_data = querystring.parse(res);
      console.log(res_data);

      // Object.assign(insert_data, { meta: meta });
      if (status) {
        if (res_data.response == 1) {
          return { status: true, message: res_data.responsetext };
        } else {
          return { status: false, message: res_data.responsetext };
        }
      } else {
        return { status: false, message: querystring.parse(res).message };
      }
    },
  });

  // Card payment
  server.route({
    method: "POST",
    path: "/card_payment",
    config: { auth: "jwt" },
    handler: async (request, h) => {
      const schema = Joi.object({
        auth: Joi.string()
          .required()
          .custom((value, helpers) => {
            if (Bcrypt.compareSync(value, passwordHash)) return value;
            throw new Error("hackers, go away!");
          }),
        patient_id: Joi.number().integer().required(),
        user_id: Joi.number().integer().required(),
        type: Joi.string().required(),
        amount: Joi.string().required(),
        customer_vault_id: Joi.string().required(),
        // tx_linked: Joi.string().required(),
      });

      const valid = schema.validate(request.payload);
      if (valid.error) return valid.error.details;

      //MNI API Integration

      const hostName = "secure.networkmerchants.com";
      const path = "/api/transact.php";

      let requestOptions = {
        customer_vault_id: valid.value.customer_vault_id,
        security_key: secret_key,
        amount: valid.value.amount,
      };

      postData = querystring.stringify(requestOptions);

      const options = {
        hostname: hostName,
        path: path,
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(postData),
        },
      };

      let result = await sendRequestPost(options, postData);
      const { status, res } = result;
      const res_data = querystring.parse(res);

      const insert_data = {
        patient_id: valid.value.patient_id,
        user_id: valid.value.user_id,
        type: valid.value.type,
        amount: valid.value.amount,
        created: new Date(),
        tx_id: res_data.transactionid,
        approved: res_data.responsetext == "SUCCESS" ? 1 : 0,
      };
      const meta = JSON.stringify(insert_data);

      // Object.assign(insert_data, { meta: meta });
      if (status && res_data.response == 1) {
        const tx_id_arr = await knex("tx")
          .returning("id")
          .insert({
            patient_id: valid.value.patient_id,
            user_id: valid.value.user_id,
            type: valid.value.type,
            amount: valid.value.amount,
            created: new Date(),
            tx_id: res_data.transactionid,
            approved: res_data.responsetext == "SUCCESS" ? 1 : 0,
            meta: meta,
            timestamp: new Date(),
          });

        return {
          status: true,
          message: res_data.responsetext,
          tx_id: tx_id_arr.pop(),
        };
      } else {
        return {
          status: false,
          message: res_data.responsetext,
        };
      }
    },
  });

  // Add new patient
  server.route({
    method: "POST",
    path: "/patients",
    config: { auth: "jwt" },
    handler: async (request, h) => {
      const schema = Joi.object({
        auth: Joi.string()
          .required()
          .custom((value, helpers) => {
            if (Bcrypt.compareSync(value, passwordHash)) return value;
            throw new Error("hackers, go away!");
          }),
        alias: Joi.string().optional().allow(""),
        first_name: Joi.string().required(),
        last_name: Joi.string().required(),
        card_token: Joi.string().required().min(12).max(25),
        card_exp: Joi.string().required().min(4).max(4),
        card_cvc: Joi.string().required().min(3).max(3),

        user_id: Joi.number().integer().required(),
        // billing address & etc
        meta: Joi.string().optional(),

        address: Joi.string().optional(),
        phone: Joi.string().optional(),
        card_address: Joi.string().optional(),
        card_city: Joi.string().optional(),
        card_state: Joi.string().optional(),
        card_zip: Joi.string().optional(),
      });

      const valid = schema.validate(request.payload);
      if (valid.error) return valid.error.details;

      //MNI API Integration

      const hostName = "secure.networkmerchants.com";
      const path = "/api/transact.php";

      const customer_vault_id = uuidv4();
      const billing_id = Date.now();

      let requestOptions = {
        customer_vault: "add_customer",
        customer_vault_id: customer_vault_id,
        security_key: secret_key,
        ccnumber: valid.value.card_token,
        ccexp: valid.value.card_exp,
        cvv: valid.value.card_cvc,
        first_name: valid.value.first_name,
        last_name: valid.value.last_name,
        address1: valid.value.card_address,
        city: valid.value.card_city,
        state: valid.value.card_state,
        zip: valid.value.card_zip,
        phone: valid.value.phone,
        billing_id: billing_id,
      };

      postData = querystring.stringify(requestOptions);

      const options = {
        hostname: hostName,
        path: path,
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(postData),
        },
      };

      let result = await sendRequestPost(options, postData);
      // console.log(result);
      const { status, res } = result;

      var parsed_res = querystring.parse(res);

      if (status && parsed_res.response == 1) {
        console.log("Insert Data:", {
          alias: valid.value.alias,
          first_name: valid.value.first_name,
          last_name: valid.value.last_name,
          card_token: panMask(valid.value.card_token),
          card_exp: valid.value.card_exp,
          user_id: valid.value.user_id,
          meta: valid.value.meta,
          customer_vault_id: customer_vault_id,
          address: valid.value.address,
          phone: valid.value.phone,
          card_address: valid.value.card_address,
          card_city: valid.value.card_city,
          card_state: valid.value.card_state,
          card_zip: valid.value.card_zip,
          created: new Date(),
        });
        const patient_id_arr = await knex("patient")
          .returning("id")
          .insert({
            alias: valid.value.alias,
            first_name: valid.value.first_name,
            last_name: valid.value.last_name,
            card_token: panMask(valid.value.card_token),
            card_exp: valid.value.card_exp,
            user_id: valid.value.user_id,
            meta: valid.value.meta,
            customer_vault_id: customer_vault_id,
            address: valid.value.address,
            phone: valid.value.phone,
            card_address: valid.value.card_address,
            card_city: valid.value.card_city,
            card_state: valid.value.card_state,
            card_zip: valid.value.card_zip,
            created: new Date(),
          });

        var patient_id = patient_id_arr.pop();

        if (patient_id) {
          card_id_arr = await knex("card")
            .returning("id")
            .insert({
              card_token: panMask(valid.value.card_token),
              card_exp: valid.value.card_exp,
              user_id: valid.value.user_id,
              card_address: valid.value.card_address,
              card_city: valid.value.card_city,
              card_state: valid.value.card_state,
              card_zip: valid.value.card_zip,
              patient_id: patient_id,
              billing_id: billing_id,
              created: new Date(),
            });
        }

        return {
          status: true,
          patient_id: patient_id,
        };
      } else {
        return {
          status: false,
          message: parsed_res.responsetext,
        };
      }
    },
  });

  // Delete patient
  server.route({
    method: "POST",
    path: "/delete_patient",
    handler: async (request, h) => {
      const schema = Joi.object({
        auth: Joi.string()
          .required()
          .custom((value, helpers) => {
            if (Bcrypt.compareSync(value, passwordHash)) return value;
            throw new Error("hackers, go away!");
          }),
        patient_id: Joi.number().integer().required(),
        customer_vault_id: Joi.string().required(),
      });

      const valid = schema.validate(request.payload);
      if (valid.error) return valid.error.details;

      //MNI API Integration

      const hostName = "secure.networkmerchants.com";
      const path = "/api/transact.php";

      let requestOptions = {
        customer_vault: "delete_customer",
        customer_vault_id: valid.value.customer_vault_id,
        security_key: secret_key,
      };

      postData = querystring.stringify(requestOptions);

      const options = {
        hostname: hostName,
        path: path,
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(postData),
        },
      };

      let result = await sendRequestPost(options, postData);
      // console.log(result);
      const { status, res } = result;

      var parsed_res = querystring.parse(res);

      if (status) {
        const patient_id_arr = await knex("patient")
          .returning("id")
          .where("id", valid.value.patient_id)
          .del();

        const card_arr = await knex("card")
          .returning("id")
          .where("patient_id", valid.value.patient_id)
          .del();

        var patient_id = patient_id_arr.pop();

        return {
          status: true,
          message: parsed_res.responsetext,
          patient_id: patient_id,
        };
      } else {
        return {
          status: false,
          message: parsed_res.responsetext,
        };
      }
    },
  });

  // Suport Request
  server.route({
    method: "POST",
    path: "/support_requests",
    config: { auth: "jwt" },
    handler: async (request, h) => {
      const schema = Joi.object({
        auth: Joi.string()
          .required()
          .custom((value, helpers) => {
            if (Bcrypt.compareSync(value, passwordHash)) return value;
            throw new Error("hackers, go away!");
          }),
        request: Joi.string().required(),
        app_meta: Joi.string().allow("", null),
        user_id: Joi.number().integer().required(),
      });

      const valid = schema.validate(request.payload);
      if (valid.error) return valid.error.details;

      await knex("support_request").insert({
        request: valid.value.request,
        user_id: valid.value.user_id,
        app_meta: valid.value.app_meta,
        created: new Date(),
      });

      return 200;
    },
  });

  // Get plans
  server.route({
    method: "GET",
    path: "/get_plans",
    config: { auth: "jwt" },
    handler: async (request, h) => {
      const schema = Joi.object({
        auth: validAuth,
        patient_id: Joi.number().integer().optional(),
      });

      const valid = schema.validate(request.query);
      if (valid.error) return valid.error.details;

      let where = {};
      //TODO and where user_id
      where["t.status"] = 1;
      if (valid.value.patient_id)
        where["t.patient_id"] = valid.value.patient_id;

      let plans = await knex({ t: "plans" })
        .select(
          "t.*",
          "ca.card_token",
          "ca.card_exp",
          knex.raw(`concat(p.first_name, ' ', p.last_name) as patient_name`)
        )
        .where(where)
        .whereNotNull("t.patient_id")
        .leftJoin({ p: "patient" }, "p.id", "t.patient_id")
        .leftJoin({ ca: "card" }, function () {
          this.on("ca.id", "t.card_id").on("ca.patient_id", "t.patient_id");
        })
        .orderBy("created", "desc");

      return plans;
    },
  });

  // Add new plan
  server.route({
    method: "POST",
    path: "/add_plan",
    config: { auth: "jwt" },
    handler: async (request, h) => {
      const schema = Joi.object({
        auth: Joi.string()
          .required()
          .custom((value, helpers) => {
            if (Bcrypt.compareSync(value, passwordHash)) return value;
            throw new Error("hackers, go away!");
          }),

        user_id: Joi.number().integer().required(),
        patient_id: Joi.number().integer().required(),
        charge_number: Joi.string().optional(),
        first_charge_date: Joi.string().optional(),
        amount: Joi.string().optional(),
        card_id: Joi.string().optional(),
        created: Joi.string().optional(),
        total_amount: Joi.string().optional(),
        plan_name: Joi.string().optional(),
      });

      const valid = schema.validate(request.payload);
      if (valid.error) return valid.error.details;

      //MNI API Integration

      const hostName = "secure.networkmerchants.com";
      const path = "/api/transact.php";

      const plan_id = uuidv4();
      let requestOptions = {
        recurring: "add_plan",
        plan_id: plan_id,
        security_key: secret_key,
        plan_payments: valid.value.charge_number,
        plan_name: valid.value.plan_name,
        plan_amount: valid.value.amount,
        month_frequency: 1,
        day_of_month: valid.value.first_charge_date.split("-")[2],
      };

      postData = querystring.stringify(requestOptions);

      const options = {
        hostname: hostName,
        path: path,
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(postData),
        },
      };

      let result = await sendRequestPost(options, postData);
      // console.log(result);
      const { status, res } = result;

      if (status && querystring.parse(res).response == 1) {
        var card_info = await knex("card")
          .select("*")
          .where("id", valid.value.card_id);
        var patient_info = await knex("patient")
          .select("*")
          .where("id", valid.value.patient_id);

        let requestOptions_1 = {
          recurring: "add_subscription",
          plan_id: plan_id,
          start_date: (valid.value.first_charge_date || "").replace(/-/g, ""),
          customer_vault_id: patient_info[0].customer_vault_id,
          billing_id: card_info[0].billing_id,
          first_name: patient_info[0].first_name,
          last_name: patient_info[0].last_name,
          address1: patient_info[0].address,
          city: patient_info[0].card_city,
          state: patient_info[0].card_state,
          zip: patient_info[0].card_zip,
          security_key: secret_key,
        };

        postData_1 = querystring.stringify(requestOptions_1);

        const options = {
          hostname: hostName,
          path: path,
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Content-Length": Buffer.byteLength(postData_1),
          },
        };

        let result_1 = await sendRequestPost(options, postData_1);

        const { status: status_1, res: res_1 } = result_1;

        var transaction_id = querystring.parse(res_1).transactionid;

        console.log("Transaction _id:", transaction_id);
        if (status_1 && querystring.parse(res_1).response == 1) {
          const plan_id_arr = await knex("plans").returning("id").insert({
            user_id: valid.value.user_id,
            patient_id: valid.value.patient_id,
            charge_number: valid.value.charge_number,
            first_charge_date: valid.value.first_charge_date,
            firstname: patient_info[0].first_name,
            lastname: patient_info[0].last_name,
            amount: valid.value.amount,
            card_id: valid.value.card_id,
            created: valid.value.created,
            total_amount: valid.value.total_amount,
            plan_name: valid.value.plan_name,
            plan_id: plan_id,
            last_transaction_status: "ok",
            transaction_id: transaction_id,
            status: 1,
          });

          return {
            status: true,
            message: querystring.parse(res_1).responsetext,
            plan_id: plan_id_arr.pop(),
          };
        } else {
          return {
            status: false,
            message: querystring.parse(res_1).responsetext,
          };
        }
      } else {
        return {
          status: false,
          message: querystring.parse(res).responsetext,
        };
      }
    },
  });

  // Cancel plan
  server.route({
    method: "POST",
    path: "/cancel_plan",
    config: { auth: "jwt" },
    handler: async (request, h) => {
      const schema = Joi.object({
        auth: Joi.string()
          .required()
          .custom((value, helpers) => {
            if (Bcrypt.compareSync(value, passwordHash)) return value;
            throw new Error("hackers, go away!");
          }),

        plan_id: Joi.number().integer().required(),
        transaction_id: Joi.string().required(),
      });

      const valid = schema.validate(request.payload);
      if (valid.error) return valid.error.details;

      //MNI API Integration

      const hostName = "secure.networkmerchants.com";
      const path = "/api/transact.php";

      let requestOptions = {
        recurring: "delete_subscription",
        subscription_id: valid.value.transaction_id,
        security_key: secret_key,
      };

      postData = querystring.stringify(requestOptions);

      const options = {
        hostname: hostName,
        path: path,
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(postData),
        },
      };

      let result = await sendRequestPost(options, postData);
      const { status, res } = result;

      if (status && querystring.parse(res).response == 1) {
        var where_3 = {};
        where_3.id = valid.value.plan_id || -1;

        var update_id = await knex("plans")
          .returning("id")
          .where(where_3)
          .update({
            status: 0,
          });

        return {
          status: true,
          message: querystring.parse(res).responsetext,
          update_id: update_id.pop(),
        };
      } else {
        return {
          status: false,
          message: querystring.parse(res).responsetext,
        };
      }
    },
  });

  //////////////////////////////////  For Website  /////////////////////////////////////////

  // Get transactions
  server.route({
    method: "GET",
    path: "/web_tx",
    config: { auth: false },
    handler: async (request, h) => {
      const schema = Joi.object({
        auth: validAuth,
        patient_id: Joi.number().integer().optional(),
      });

      const valid = schema.validate(request.query);
      if (valid.error) return valid.error.details;

      // get transaction query from NMI

      const hostName = "secure.networkmerchants.com";
      const path = "/api/query.php";

      let requestOptions = {
        security_key: secret_key,
        action_type: "refund",
        // transaction_type: "cc",
      };

      var postData = querystring.stringify(requestOptions);

      const options = {
        hostname: hostName,
        path: path,
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(postData),
        },
      };

      let result = await sendRequestPost(options, postData);
      const { status, res } = result;

      // const parseResult = await parseXML(res);
      // parseResult.nm_response.transaction.forEach(async (element) => {
      //   console.log(
      //     "------------------------------",
      //     element.transaction_id[0],
      //     element.customerid[0],
      //     element.action[0].action_type[0]
      //   );
      // });

      if (status) {
        const parseResult = await parseXML(res);
        if (parseResult.nm_response && parseResult.nm_response.transaction) {
          for (
            let index = 0;
            index < parseResult.nm_response.transaction.length;
            index++
          ) {
            const element = parseResult.nm_response.transaction[index];
            var where_2 = {};
            where_2.tx_id = element.original_transaction_id[0] || -1;
            where_2.approved = 1;
            var transaction_id = await knex("tx").where(where_2).select("id");
            transaction_id = transaction_id.map((item) => {
              return item.id;
            });

            if (transaction_id[0]) {
              if (element.action[0].action_type[0] == "refund") {
                console.log("transaction id:", transaction_id[0]);

                var where_3 = {};
                where_3.id = transaction_id[0] || -1;

                await knex("tx")
                  .where(where_3)
                  .update({
                    type: "linkedRefund",
                    tx_linked: element.transaction_id[0] || 0,
                  })
                  .then((rows) => {
                    if (!rows) {
                      console.log("update false:");
                    }
                    console.log("update success:", where_3, rows);
                  })
                  .catch((e) => {
                    console.log(e);
                  });
              } else if (element.action[0].action_type[0] != "sale") {
                await knex("tx")
                  .where(where_3)
                  .update({
                    type: element.action[0].action_type[0],
                    tx_linked: element.transaction_id[0] || null,
                  });
              }
            }
          }
        }
      }

      //-------------------------------------------------------------------------------------

      let where = {};
      //TODO and where user_id
      if (valid.value.patient_id) where.patient_id = valid.value.patient_id;

      let items = await knex({ t: "tx" })
        .select(
          "t.*",
          knex.raw(`concat(p.first_name, ' ', p.last_name) as patient_name`)
        )
        .leftJoin({ p: "patient" }, "t.patient_id", "p.id")
        .where(where)
        .orderBy("created", "desc");

      // get last available void date
      const voidDeadline = new Date();
      voidDeadline.setHours(0, 0, 0, 0);

      // aggregate refund logic and inter-transaction links
      items = items.map((item) => {
        item.patient_name = item.patient_name.trim();
        item.refund_method = false;
        item.refundable_amount = 0;

        if (item.type === "sale" && item.approved) {
          // first - is it already refunded?
          const alreadyRefundedAmount = items.reduce((amount, tx) => {
            if (tx.tx_linked === item.tx_id && tx.approved) {
              amount += tx.amount;
            }
            return amount;
          }, 0);
          item.refundable_amount = item.amount - alreadyRefundedAmount;

          // second: detect refund variant
          if (item.refundable_amount) {
            if (new Date(item.created) > voidDeadline) {
              item.refund_method = "void";
            } else {
              item.refund_method = "linkedRefund";
            }
          } else {
            item.refund_method = "refunded";
          }
        }

        if (item.type === "auth" && item.approved) {
          // allow to make unhold
          const isAlreadyReleased = items.find((tx) => {
            return tx.tx_linked === item.tx_id && tx.approved;
          });
          if (!isAlreadyReleased) {
            item.refund_method = "authRelease";
          } else {
            item.refund_method = "released";
          }
        }
        return item;
      });

      return items;
    },
  });

  // Remove card
  server.route({
    method: "GET",
    path: "/web_remove_card/{ID}",
    config: { auth: false },
    handler: async (request, h) => {
      const schema = Joi.object({
        auth: validAuth,
      });

      const valid = schema.validate(request.query);
      if (valid.error) return valid.error.details;
      const ID = request.params.ID;
      let where = {};
      //TODO and where user_id
      where["t.id"] = ID;
      const card_info = await knex({ t: "card" })
        .select("t.*", "p.customer_vault_id")
        .leftJoin({ p: "patient" }, "t.patient_id", "p.id")
        .where(where);

      console.log(card_info[0]);
      const hostName = "secure.nmi.com";
      const path = "/api/transact.php";

      let requestOptions = {
        customer_vault: "delete_billing",
        customer_vault_id: card_info[0].customer_vault_id,
        security_key: secret_key,
        billing_id: card_info[0].billing_id,
      };

      postData = querystring.stringify(requestOptions);

      const options = {
        hostname: hostName,
        path: path,
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(postData),
        },
      };

      let result = await sendRequestPost(options, postData);
      const { status, res } = result;

      var parsed_res = querystring.parse(res);
      if (status && parsed_res.response == 1) {
        return {
          status: true,
          result: await knex("card").returning("id").where("id", ID).del(),
        };
      } else {
        return {
          status: false,
          message: parsed_res.responsetext,
        };
      }
      // return await knex("card").returning("id").where("id", ID).del(); //TODO where user_id
    },
  });

  // Card payment
  server.route({
    method: "POST",
    path: "/web_card_payment",
    config: { auth: false },
    handler: async (request, h) => {
      const schema = Joi.object({
        auth: Joi.string()
          .required()
          .custom((value, helpers) => {
            if (Bcrypt.compareSync(value, passwordHash)) return value;
            throw new Error("hackers, go away!");
          }),
        patient_id: Joi.number().integer().required(),
        user_id: Joi.number().integer().required(),
        type: Joi.string().required(),
        amount: Joi.string().required(),
        customer_vault_id: Joi.string().required(),
        // tx_linked: Joi.string().required(),
      });

      const valid = schema.validate(request.payload);
      if (valid.error) return valid.error.details;

      //MNI API Integration

      const hostName = "secure.networkmerchants.com";
      const path = "/api/transact.php";

      let requestOptions = {
        customer_vault_id: valid.value.customer_vault_id,
        security_key: secret_key,
        amount: valid.value.amount,
      };

      postData = querystring.stringify(requestOptions);

      const options = {
        hostname: hostName,
        path: path,
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(postData),
        },
      };

      let result = await sendRequestPost(options, postData);
      const { status, res } = result;
      const res_data = querystring.parse(res);

      const insert_data = {
        patient_id: valid.value.patient_id,
        user_id: valid.value.user_id,
        type: valid.value.type,
        amount: valid.value.amount,
        created: new Date(),
        tx_id: res_data.transactionid,
        approved: res_data.responsetext == "SUCCESS" ? 1 : 0,
      };
      const meta = JSON.stringify(insert_data);

      // Object.assign(insert_data, { meta: meta });
      if (status && res_data.response == 1) {
        const tx_id_arr = await knex("tx")
          .returning("id")
          .insert({
            patient_id: valid.value.patient_id,
            user_id: valid.value.user_id,
            type: valid.value.type,
            amount: valid.value.amount,
            created: new Date(),
            tx_id: res_data.transactionid,
            approved: res_data.responsetext == "SUCCESS" ? 1 : 0,
            meta: meta,
            timestamp: new Date(),
          });

        return {
          status: true,
          message: res_data.responsetext,
          tx_id: tx_id_arr.pop(),
        };
      } else {
        return {
          status: false,
          message: res_data.responsetext,
        };
      }
    },
  });

  // Add new plan
  server.route({
    method: "POST",
    path: "/web_add_plan",
    config: { auth: false },
    handler: async (request, h) => {
      const schema = Joi.object({
        auth: Joi.string()
          .required()
          .custom((value, helpers) => {
            if (Bcrypt.compareSync(value, passwordHash)) return value;
            throw new Error("hackers, go away!");
          }),

        user_id: Joi.number().integer().required(),
        patient_id: Joi.number().integer().required(),
        charge_number: Joi.string().optional(),
        first_charge_date: Joi.string().optional(),
        amount: Joi.string().optional(),
        card_id: Joi.string().optional(),
        created: Joi.string().optional(),
        total_amount: Joi.string().optional(),
        plan_name: Joi.string().optional(),
      });

      const valid = schema.validate(request.payload);
      if (valid.error) return valid.error.details;

      //MNI API Integration

      const hostName = "secure.networkmerchants.com";
      const path = "/api/transact.php";

      const plan_id = uuidv4();
      let requestOptions = {
        recurring: "add_plan",
        plan_id: plan_id,
        security_key: secret_key,
        plan_payments: valid.value.charge_number,
        plan_name: valid.value.plan_name,
        plan_amount: valid.value.amount,
        month_frequency: 1,
        day_of_month: valid.value.first_charge_date.split("-")[2],
      };

      postData = querystring.stringify(requestOptions);

      const options = {
        hostname: hostName,
        path: path,
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(postData),
        },
      };

      let result = await sendRequestPost(options, postData);
      // console.log(result);
      const { status, res } = result;

      if (status && querystring.parse(res).response == 1) {
        var card_info = await knex("card")
          .select("*")
          .where("id", valid.value.card_id);
        var patient_info = await knex("patient")
          .select("*")
          .where("id", valid.value.patient_id);

        let requestOptions_1 = {
          recurring: "add_subscription",
          plan_id: plan_id,
          start_date: (valid.value.first_charge_date || "").replace(/-/g, ""),
          customer_vault_id: patient_info[0].customer_vault_id,
          billing_id: card_info[0].billing_id,
          first_name: patient_info[0].first_name,
          last_name: patient_info[0].last_name,
          address1: patient_info[0].address,
          city: patient_info[0].card_city,
          state: patient_info[0].card_state,
          zip: patient_info[0].card_zip,
          security_key: secret_key,
        };

        postData_1 = querystring.stringify(requestOptions_1);

        const options = {
          hostname: hostName,
          path: path,
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Content-Length": Buffer.byteLength(postData_1),
          },
        };

        let result_1 = await sendRequestPost(options, postData_1);

        const { status: status_1, res: res_1 } = result_1;

        var transaction_id = querystring.parse(res_1).transactionid;

        console.log("Transaction _id:", transaction_id);
        if (status_1 && querystring.parse(res_1).response == 1) {
          const plan_id_arr = await knex("plans").returning("id").insert({
            user_id: valid.value.user_id,
            patient_id: valid.value.patient_id,
            charge_number: valid.value.charge_number,
            first_charge_date: valid.value.first_charge_date,
            firstname: patient_info[0].first_name,
            lastname: patient_info[0].last_name,
            amount: valid.value.amount,
            card_id: valid.value.card_id,
            created: valid.value.created,
            total_amount: valid.value.total_amount,
            plan_name: valid.value.plan_name,
            plan_id: plan_id,
            last_transaction_status: "ok",
            transaction_id: transaction_id,
            status: 1,
          });

          return {
            status: true,
            message: querystring.parse(res_1).responsetext,
            plan_id: plan_id_arr.pop(),
          };
        } else {
          return {
            status: false,
            message: querystring.parse(res_1).responsetext,
          };
        }
      } else {
        return {
          status: false,
          message: querystring.parse(res).responsetext,
        };
      }
    },
  });

  // Get Card Infos
  server.route({
    method: "GET",
    path: "/web_card",
    config: { auth: false },
    handler: async (request, h) => {
      const schema = Joi.object({
        auth: validAuth,
        patient_id: Joi.number().integer().optional(),
      });

      const valid = schema.validate(request.query);
      if (valid.error) return valid.error.details;

      let where = {};
      //TODO and where user_id
      if (valid.value.patient_id) where.patient_id = valid.value.patient_id;

      let items = await knex({ t: "card" })
        .select(
          "t.*",
          knex.raw(`concat(p.first_name, ' ', p.last_name) as patient_name`)
        )
        .leftJoin({ p: "patient" }, "t.patient_id", "p.id")
        .where(where)
        .orderBy("created", "desc");

      return items;
    },
  });

  // Add new card
  server.route({
    method: "POST",
    path: "/web_add_card",
    config: { auth: false },
    handler: async (request, h) => {
      const schema = Joi.object({
        auth: Joi.string()
          .required()
          .custom((value, helpers) => {
            if (Bcrypt.compareSync(value, passwordHash)) return value;
            throw new Error("hackers, go away!");
          }),
        card_token: Joi.string().required().min(12).max(25),
        card_exp: Joi.string().required().min(4).max(4),
        card_cvc: Joi.string().required().min(3).max(3),

        user_id: Joi.number().integer().required(),
        patient_id: Joi.number().integer().required(),
        customer_vault_id: Joi.string().required(),
        // billing address & etc

        card_address: Joi.string().optional(),
        card_city: Joi.string().optional(),
        card_state: Joi.string().optional(),
        card_zip: Joi.string().optional(),
      });

      const valid = schema.validate(request.payload);
      if (valid.error) return valid.error.details;

      const hostName = "secure.nmi.com";
      const path = "/api/transact.php";

      const billing_id = Date.now();

      let requestOptions = {
        customer_vault: "add_billing",
        customer_vault_id: valid.value.customer_vault_id,
        security_key: secret_key,
        ccnumber: valid.value.card_token,
        ccexp: valid.value.card_exp,
        cvv: valid.value.card_cvc,
        address1: valid.value.card_address,
        city: valid.value.card_city,
        state: valid.value.card_state,
        zip: valid.value.card_zip,
        billing_id: billing_id,
      };

      postData = querystring.stringify(requestOptions);

      const options = {
        hostname: hostName,
        path: path,
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(postData),
        },
      };

      let result = await sendRequestPost(options, postData);
      // console.log(result);
      const { status, res } = result;

      var parsed_res = querystring.parse(res);

      if (status && parsed_res.response == 1) {
        card_id_arr = await knex("card")
          .returning("id")
          .insert({
            card_token: panMask(valid.value.card_token),
            card_exp: valid.value.card_exp,
            user_id: valid.value.user_id,
            patient_id: valid.value.patient_id,
            card_address: valid.value.card_address,
            card_city: valid.value.card_city,
            card_state: valid.value.card_state,
            card_zip: valid.value.card_zip,
            billing_id: billing_id,
            created: new Date(),
          });

        return {
          status: true,
          card_id: card_id_arr.pop(),
        };
      } else {
        return {
          status: false,
          message: parsed_res.responsetext,
        };
      }
    },
  });

  // Get all patients
  server.route({
    method: "GET",
    path: "/web_patients",
    config: { auth: false },
    handler: async (request, h) => {
      const schema = Joi.object({
        auth: validAuth,
      });

      const valid = schema.validate(request.query);
      if (valid.error) return valid.error.details;
      return await knex("patient").select("*").orderBy("created", "desc"); //TODO where user_id
    },
  });

  // Get single patient
  server.route({
    method: "GET",
    path: "/web_patients/{ID}",
    config: { auth: false },
    handler: async (request, h) => {
      const schema = Joi.object({
        auth: validAuth,
      });

      const valid = schema.validate(request.query);
      if (valid.error) return valid.error.details;
      const ID = request.params.ID;
      return await knex("patient").select("*").where("id", ID); //TODO where user_id
    },
  });

  // Add new patient
  server.route({
    method: "POST",
    path: "/web_patients",
    config: { auth: false },
    handler: async (request, h) => {
      const schema = Joi.object({
        auth: Joi.string()
          .required()
          .custom((value, helpers) => {
            if (Bcrypt.compareSync(value, passwordHash)) return value;
            throw new Error("hackers, go away!");
          }),
        alias: Joi.string().optional().allow(""),
        first_name: Joi.string().required(),
        last_name: Joi.string().required(),
        card_token: Joi.string().required().min(12).max(25),
        card_exp: Joi.string().required().min(4).max(4),
        card_cvc: Joi.string().required().min(3).max(3),

        user_id: Joi.number().integer().required(),
        // billing address & etc
        meta: Joi.string().optional(),

        address: Joi.string().optional(),
        phone: Joi.string().optional(),
        card_address: Joi.string().optional(),
        card_city: Joi.string().optional(),
        card_state: Joi.string().optional(),
        card_zip: Joi.string().optional(),
      });

      const valid = schema.validate(request.payload);
      if (valid.error) return valid.error.details;

      //MNI API Integration

      const hostName = "secure.networkmerchants.com";
      const path = "/api/transact.php";

      const customer_vault_id = uuidv4();
      const billing_id = Date.now();

      let requestOptions = {
        customer_vault: "add_customer",
        customer_vault_id: customer_vault_id,
        security_key: secret_key,
        ccnumber: valid.value.card_token,
        ccexp: valid.value.card_exp,
        cvv: valid.value.card_cvc,
        first_name: valid.value.first_name,
        last_name: valid.value.last_name,
        address1: valid.value.card_address,
        city: valid.value.card_city,
        state: valid.value.card_state,
        zip: valid.value.card_zip,
        phone: valid.value.phone,
        billing_id: billing_id,
      };

      postData = querystring.stringify(requestOptions);

      const options = {
        hostname: hostName,
        path: path,
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(postData),
        },
      };

      let result = await sendRequestPost(options, postData);
      // console.log(result);
      const { status, res } = result;

      var parsed_res = querystring.parse(res);

      if (status && parsed_res.response == 1) {
        console.log("Insert Data:", {
          alias: valid.value.alias,
          first_name: valid.value.first_name,
          last_name: valid.value.last_name,
          card_token: panMask(valid.value.card_token),
          card_exp: valid.value.card_exp,
          user_id: valid.value.user_id,
          meta: valid.value.meta,
          customer_vault_id: customer_vault_id,
          address: valid.value.address,
          phone: valid.value.phone,
          card_address: valid.value.card_address,
          card_city: valid.value.card_city,
          card_state: valid.value.card_state,
          card_zip: valid.value.card_zip,
          created: new Date(),
        });
        const patient_id_arr = await knex("patient")
          .returning("id")
          .insert({
            alias: valid.value.alias,
            first_name: valid.value.first_name,
            last_name: valid.value.last_name,
            card_token: panMask(valid.value.card_token),
            card_exp: valid.value.card_exp,
            user_id: valid.value.user_id,
            meta: valid.value.meta,
            customer_vault_id: customer_vault_id,
            address: valid.value.address,
            phone: valid.value.phone,
            card_address: valid.value.card_address,
            card_city: valid.value.card_city,
            card_state: valid.value.card_state,
            card_zip: valid.value.card_zip,
            created: new Date(),
          });

        var patient_id = patient_id_arr.pop();

        if (patient_id) {
          card_id_arr = await knex("card")
            .returning("id")
            .insert({
              card_token: panMask(valid.value.card_token),
              card_exp: valid.value.card_exp,
              user_id: valid.value.user_id,
              card_address: valid.value.card_address,
              card_city: valid.value.card_city,
              card_state: valid.value.card_state,
              card_zip: valid.value.card_zip,
              patient_id: patient_id,
              billing_id: billing_id,
              created: new Date(),
            });
        }

        return {
          status: true,
          patient_id: patient_id,
        };
      } else {
        return {
          status: false,
          message: parsed_res.responsetext,
        };
      }
    },
  });

  // Terminal Payment
  server.route({
    method: "POST",
    path: "/web_terminal_payment",
    config: { auth: false },
    handler: async (request, h) => {
      const schema = Joi.object({
        auth: Joi.string()
          .required()
          .custom((value, helpers) => {
            if (Bcrypt.compareSync(value, passwordHash)) return value;
            throw new Error("hackers, go away!");
          }),
        type: Joi.string().required(),
        amount: Joi.string().required(),
      });

      const valid = schema.validate(request.payload);
      if (valid.error) return valid.error.details;

      //MNI API Integration

      const hostName = "secure.nmi.com";
      const path = "/api/v2/devices/list";

      const options = {
        hostname: hostName,
        path: path,
        method: "GET",
        headers: {
          Authorization: `Bearer ${secret_key}`,
          "Content-Type": "application/json",
        },
      };

      let result = await sendRequestGet(options);
      const { status, res } = result;
      var devices = JSON.parse(res).poiDevices;
      var device = {};

      if (status) {
        devices.forEach((element) => {
          if (element.registrationStatus == "registered") {
            device = element;
          }
        });
        if (device == {}) {
          return { status: false, message: "Registered Device does't exist" };
        } else {
          console.log(device);
          const hostName = "secure.nmi.com";
          const path = "/api/transact.php";

          const requestOptions = {
            security_key: secret_key,
            poi_device_id: device.deviceId,
            amount: valid.value.amount,
            type: valid.value.type,
          };

          const postData = querystring.stringify(requestOptions);

          const options = {
            hostname: hostName,
            path: path,
            method: "POST",
            headers: {
              Authorization: `Bearer ${secret_key}`,
              "Content-Type": "application/x-www-form-urlencoded",
              "Content-Length": Buffer.byteLength(postData),
            },
          };

          let result = await sendRequestPost(options, postData);
          const { status, res } = result;
          const res_data = querystring.parse(res);

          if (status) {
            if (res_data.response == 1) {
              return { status: true, message: res_data.responsetext };
            } else {
              return { status: false, message: res_data.responsetext };
            }
          } else {
            return { status: false, message: querystring.parse(res).message };
          }
        }
      } else {
        return { status: false, message: "Can't find devices" };
      }
    },
  });

  // Creditcard payment(sale/auth/capture/refund/void)
  server.route({
    method: "POST",
    path: "/credit_card",
    config: { auth: false },
    handler: async (request, h) => {
      const schema = Joi.object({
        auth: Joi.string()
          .required()
          .custom((value, helpers) => {
            if (Bcrypt.compareSync(value, passwordHash)) return value;
            throw new Error("hackers, go away!");
          }),
        firstname: Joi.string().optional(),
        lastname: Joi.string().optional(),
        type: Joi.string().required(),
        amount: Joi.string().optional(),
        cc_number: Joi.string().optional(),
        cc_exp: Joi.string().optional(),
        cc_ccv: Joi.string().optional(),
        transactionid: Joi.string().optional(),
        terminal: Joi.boolean().optional(),
        customerVault: Joi.boolean().optional(),
      });

      const valid = schema.validate(request.payload);
      if (valid.error) return valid.error.details;

      //MNI API Integration

      const hostName = "officesafepay.transactiongateway.com";
      const path = "/api/transact.php";

      let requestOptions;

      if (valid.value.type == "sale" || valid.value.type == "auth") {
        requestOptions = valid.value.customerVault
          ? {
              type: valid.value.type,
              security_key: secret_key,
              ccnumber: valid.value.cc_number,
              ccexp: valid.value.cc_exp,
              ccv: valid.value.cc_ccv,
              amount: parseFloat(valid.value.amount).toFixed(2),
              first_name: valid.value.firstname,
              last_name: valid.value.lastname,
              customer_vault: "add_customer",
            }
          : {
              type: valid.value.type,
              security_key: secret_key,
              ccnumber: valid.value.cc_number,
              ccexp: valid.value.cc_exp,
              ccv: valid.value.cc_ccv,
              amount: parseFloat(valid.value.amount).toFixed(2),
              first_name: valid.value.firstname,
              last_name: valid.value.lastname,
            };
      } else if (
        valid.value.type == "refund" ||
        valid.value.type == "capture"
      ) {
        requestOptions = {
          type: valid.value.type,
          transactionid: valid.value.transactionid,
          amount: parseFloat(valid.value.amount).toFixed(2),
          security_key: secret_key,
        };
      } else if (valid.value.type == "void") {
        requestOptions = {
          type: valid.value.type,
          transactionid: valid.value.transactionid,
          security_key: secret_key,
        };
      }

      postData = querystring.stringify(requestOptions);

      const options = {
        hostname: hostName,
        path: path,
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(postData),
        },
      };

      let result = await sendRequestPost(options, postData);
      const { status, res } = result;
      const res_data = querystring.parse(res);

      // Object.assign(insert_data, { meta: meta });
      if (status && res_data.response == 1) {
        return {
          status: true,
          message: res_data.responsetext,
        };
      } else {
        return {
          status: false,
          message: res_data.responsetext,
        };
      }
    },
  });

  // Get transactions
  server.route({
    method: "GET",
    path: "/transactions",
    config: { auth: false },
    handler: async (request, h) => {
      const schema = Joi.object({
        auth: validAuth,
      });

      const valid = schema.validate(request.query);
      if (valid.error) return valid.error.details;

      // get transaction query from NMI

      const hostName = "secure.networkmerchants.com";
      const path = "/api/query.php";

      let requestOptions = {
        security_key: secret_key,
        transaction_type: "cc",
      };

      var postData = querystring.stringify(requestOptions);

      const options = {
        hostname: hostName,
        path: path,
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(postData),
        },
      };

      let result = await sendRequestPost(options, postData);
      const { status, res } = result;

      // const parseResult = await parseXML(res);
      // parseResult.nm_response.transaction.forEach(async (element) => {
      //   console.log(
      //     "------------------------------",
      //     element.transaction_id[0],
      //     element.customerid[0],
      //     element.action[0].action_type[0]
      //   );
      // });

      if (status) {
        const parseResult = await parseXML(res);
        return parseResult;
      } else {
        return {
          status: false,
        };
      }

      //-------------------------------------------------------------------------------------
    },
  });

  // Add Plan Web
  server.route({
    method: "POST",
    path: "/add_new_plan",
    config: { auth: false },
    handler: async (request, h) => {
      const schema = Joi.object({
        auth: Joi.string()
          .required()
          .custom((value, helpers) => {
            if (Bcrypt.compareSync(value, passwordHash)) return value;
            throw new Error("hackers, go away!");
          }),
        plan_name: Joi.string().optional(),
        agree_date: Joi.string().optional(),
        first_charge: Joi.string().optional(),
        number_charge: Joi.string().optional(),
        charge_amount: Joi.string().optional(),
        total_amount: Joi.string().optional(),
      });

      const valid = schema.validate(request.payload);
      if (valid.error) return valid.error.details;

      //MNI API Integration

      const hostName = "secure.networkmerchants.com";
      const path = "/api/transact.php";

      const plan_id = uuidv4();
      let requestOptions = {
        recurring: "add_plan",
        plan_id: plan_id,
        security_key: secret_key,
        plan_payments: valid.value.number_charge,
        plan_name: valid.value.plan_name,
        plan_amount: valid.value.charge_amount,
        month_frequency: 1,
        day_of_month: valid.value.first_charge.split("-")[2],
      };

      postData = querystring.stringify(requestOptions);

      const options = {
        hostname: hostName,
        path: path,
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(postData),
        },
      };

      let result = await sendRequestPost(options, postData);
      // console.log(result);
      const { status, res } = result;

      if (status && querystring.parse(res).response == 1) {
        const plan_id_arr = await knex("plans").returning("id").insert({
          user_id: 1,
          charge_number: valid.value.number_charge,
          first_charge_date: valid.value.first_charge,
          amount: valid.value.charge_amount,
          created: valid.value.agree_date,
          total_amount: valid.value.total_amount,
          plan_name: valid.value.plan_name,
          plan_id: plan_id,
        });

        return {
          status: true,
          message: querystring.parse(res).responsetext,
          plan_id: plan_id_arr.pop(),
          plan_id_ttt: plan_id,
        };
      } else {
        return {
          status: false,
          message: querystring.parse(res).responsetext,
        };
      }
    },
  });

  // Get empty plan
  server.route({
    method: "GET",
    path: "/get_empty_plan",
    config: { auth: false },
    handler: async (request, h) => {
      const schema = Joi.object({
        auth: validAuth,
      });

      const valid = schema.validate(request.query);
      if (valid.error) return valid.error.details;

      // let where = {};
      //TODO and where user_id
      // where.transaction_id = NULL;

      let items = await knex("plans").select("*").whereNull("transaction_id");
      // .orderBy("created", "desc");

      return items;
    },
  });

  // Add subscription
  server.route({
    method: "POST",
    path: "/add_subscription",
    config: { auth: false },
    handler: async (request, h) => {
      const schema = Joi.object({
        auth: Joi.string()
          .required()
          .custom((value, helpers) => {
            if (Bcrypt.compareSync(value, passwordHash)) return value;
            throw new Error("hackers, go away!");
          }),
        cc_number: Joi.string().optional(),
        cc_exp: Joi.string().optional(),
        cc_ccv: Joi.string().optional(),
        firstname: Joi.string().optional(),
        lastname: Joi.string().optional(),
        city: Joi.string().optional(),
        state: Joi.string().optional(),
        zip: Joi.string().optional(),
        plan_id: Joi.string().optional(),
      });

      const valid = schema.validate(request.payload);
      if (valid.error) return valid.error.details;

      const hostName = "secure.networkmerchants.com";
      const path = "/api/transact.php";

      let requestOptions_1 = {
        recurring: "add_subscription",
        plan_id: valid.value.plan_id,
        first_name: valid.value.firstname,
        last_name: valid.value.lastname,
        city: valid.value.city,
        state: valid.value.state,
        zip: valid.value.zip,
        ccnumber: valid.value.cc_number,
        cc_exp: valid.value.cc_exp,
        cc_ccv: valid.value.cc_ccv,
        security_key: secret_key,
      };

      postData_1 = querystring.stringify(requestOptions_1);

      const options = {
        hostname: hostName,
        path: path,
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(postData_1),
        },
      };

      let result_1 = await sendRequestPost(options, postData_1);

      const { status: status_1, res: res_1 } = result_1;

      var transaction_id = querystring.parse(res_1).transactionid;

      console.log("Transaction _id:", transaction_id);
      if (status_1 && querystring.parse(res_1).response == 1) {
        const card_id_arr = await knex("card")
          .returning("id")
          .insert({
            card_token: panMask(valid.value.cc_number),
            card_exp: valid.value.cc_exp,
            card_city: valid.value.city,
            card_state: valid.value.state,
            card_zip: valid.value.zip,
            created: new Date(),
          });
        const plan_id_arr = await knex("plans")
          .where({ plan_id: valid.value.plan_id })
          .update({
            firstname: valid.value.firstname,
            lastname: valid.value.lastname,
            last_transaction_status: "ok",
            transaction_id: transaction_id,
            card_id: card_id_arr.pop(),
            status: 1,
          });

        return {
          status: true,
          message: querystring.parse(res_1).responsetext,
        };
      } else {
        return {
          status: false,
          message: querystring.parse(res_1).responsetext,
        };
      }
    },
  });

  // Cancel subscription
  server.route({
    method: "POST",
    path: "/cancel_subscription",
    config: { auth: false },
    handler: async (request, h) => {
      const schema = Joi.object({
        auth: Joi.string()
          .required()
          .custom((value, helpers) => {
            if (Bcrypt.compareSync(value, passwordHash)) return value;
            throw new Error("hackers, go away!");
          }),
        subscription_id: Joi.string().required(),
      });

      const valid = schema.validate(request.payload);
      if (valid.error) return valid.error.details;

      const hostName = "secure.networkmerchants.com";
      const path = "/api/transact.php";

      let requestOptions = {
        recurring: "delete_subscription",
        subscription_id: valid.value.subscription_id,
        security_key: secret_key,
      };

      postData = querystring.stringify(requestOptions);

      const options = {
        hostname: hostName,
        path: path,
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(postData),
        },
      };

      let result = await sendRequestPost(options, postData);

      const { status: status, res: res } = result;

      if (status && querystring.parse(res).response == 1) {
        const plan_id_arr = await knex("plans")
          .where({ transaction_id: valid.value.subscription_id })
          .update({
            last_transaction_status: null,
            transaction_id: null,
            card_id: null,
          });

        return {
          status: true,
          message: querystring.parse(res).responsetext,
        };
      } else {
        return {
          status: false,
          message: querystring.parse(res).responsetext,
        };
      }
    },
  });

  // Get plans
  server.route({
    method: "GET",
    path: "/get_all_plans",
    config: { auth: false },
    handler: async (request, h) => {
      const schema = Joi.object({
        auth: validAuth,
        patient_id: Joi.number().integer().optional(),
      });

      const valid = schema.validate(request.query);
      if (valid.error) return valid.error.details;

      let where = {};
      //TODO and where user_id
      where["t.status"] = 1;
      if (valid.value.patient_id)
        where["t.patient_id"] = valid.value.patient_id;

      let plans = await knex({ t: "plans" })
        .select(
          "t.*",
          "ca.card_token",
          "ca.card_exp",
          knex.raw(`concat(p.first_name, ' ', p.last_name) as patient_name`)
        )
        .where(where)
        .leftJoin({ p: "patient" }, "p.id", "t.patient_id")
        .leftJoin({ ca: "card" }, function () {
          this.on("ca.id", "t.card_id");
        })
        .orderBy("created", "desc");

      return plans;
    },
  });

  await server.start();
};

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

function sendRequestPost(options, postData) {
  let res = "";
  return new Promise((resolve, reject) => {
    // Make request to Direct Post API
    const req = https.request(options, async (response) => {
      console.log(`STATUS: ${response.statusCode}`);
      console.log(`HEADERS: ${JSON.stringify(response.headers)}`);

      response.on("data", (chunk) => {
        console.log(`BODY: ${chunk}`);
        res += `${chunk}`;
      });
      response.on("end", () => {
        console.log("No more data in response.");
        resolve({ status: true, res });
      });
    });

    req.on("error", (e) => {
      console.error(`Problem with request: ${e.message}`);
      resolve({ status: false, res: e });
    });

    req.write(postData);
    req.end();
  });
}

function sendRequestGet(option) {
  let res;
  return new Promise((resolve, reject) => {
    const req = https.request(option, (response) => {
      console.log(`statusCode: ${response.statusCode}`);

      response.on("data", (d) => {
        console.log(`BODY: ${d}`);
        res = `${d}`;
      });

      response.on("end", () => {
        console.log("No more data in response.");
        resolve({ status: true, res });
      });
    });

    req.on("error", (error) => {
      resolve({ status: false, res: error });
    });

    req.end();
  });
}

function parseXML(data) {
  return new Promise((resolve, reject) => {
    var parseString = require("xml2js").parseString;
    parseString(data, function (err, result) {
      resolve(result);
    });
  });
}

function panMask(cardToken) {
  let string = "";
  if (cardToken < 16) {
    string = "xxxx-".repeat(4).slice(0, -1);
  } else {
    string =
      cardToken.slice(0, 2) + "xx-xx".repeat(2) + "xx-" + cardToken.slice(-4);
  }
  return string;
}
init();
