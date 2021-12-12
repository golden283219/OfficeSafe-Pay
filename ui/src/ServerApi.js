import { goToScreen } from "./utils";

class ServerApi {
  init({ endpoint, auth }) {
    this.endpoint = endpoint;
    this.auth = auth;
  }

  async request({ path, method = "GET", payload }) {
    const token = localStorage.getItem("token");
    if (!token) {
      goToScreen(2);
    }
    const fetchInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    };

    if (method === "GET") {
      path += (path.indexOf("?") >= 0 ? "&" : "?") + "auth=" + this.auth;
      if (payload) {
        path += Object.keys(payload).reduce((subpath, k) => {
          return (
            subpath +
            "&" +
            encodeURIComponent(k) +
            "=" +
            encodeURIComponent(payload[k])
          );
        }, "");
      }
    } else {
      fetchInit.body = JSON.stringify(
        Object.assign(
          {
            auth: this.auth,
          },
          payload
        )
      );
    }

    return fetch(this.endpoint + path, fetchInit)
      .then(
        (response) => {
          if (response.status == 401) {
            goToScreen(2);
          }
          return response.json();
        },
        (e) => {
          console.log("ServerApi deserialization error", e);
          throw e;
        }
      )
      .then((data) => {
        if (typeof data === "object" && typeof data.map === "function") {
          if (data[0] && data[0].message) {
            // it is array of errors
            throw data.map((e) => e.message || e).join(". ");
          } else {
            // valid array, pass
            return data;
          }
        }
        if (data.error && data.message) {
          // generic server error
          throw data.message;
        }
        // all ok
        return data;
      });
  }
}

export default new ServerApi();
