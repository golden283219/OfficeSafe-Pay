import React from "react";
import MaskedInput from "react-text-mask";

function CreditCardMask(props) {
  const { inputRef, ...other } = props;

  return (
    <MaskedInput
      {...other}
      ref={(ref) => {
        inputRef(ref ? ref.inputElement : null);
      }}
      mask={[
        /\d/,
        /\d/,
        /\d/,
        /\d/,
        " ",
        " ",
        " ",
        /\d/,
        /\d/,
        /\d/,
        /\d/,
        " ",
        " ",
        " ",
        /\d/,
        /\d/,
        /\d/,
        /\d/,
        " ",
        " ",
        " ",
        /\d/,
        /\d/,
        /\d/,
        /\d/,
        " ",
      ]}
      placeholderChar={"_"}
      showMask
    />
  );
}

function AMEXCreditCardMask(props) {
  const { inputRef, ...other } = props;

  return (
    <MaskedInput
      {...other}
      ref={(ref) => {
        inputRef(ref ? ref.inputElement : null);
      }}
      mask={[
        /\d/,
        /\d/,
        /\d/,
        /\d/,
        " ",
        " ",
        " ",
        /\d/,
        /\d/,
        /\d/,
        /\d/,
        /\d/,
        /\d/,
        " ",
        " ",
        " ",
        /\d/,
        /\d/,
        /\d/,
        /\d/,
        /\d/,
      ]}
      placeholderChar={"_"}
      showMask
    />
  );
}

function ExpireMask(props) {
  const { inputRef, ...other } = props;

  return (
    <MaskedInput
      {...other}
      ref={(ref) => {
        inputRef(ref ? ref.inputElement : null);
      }}
      mask={[/\d/, " ", /\d/, " ", /\d/, " ", /\d/]}
      placeholderChar={"_"}
      showMask
    />
  );
}

function CCVMask(props) {
  const { inputRef, ...other } = props;

  return (
    <MaskedInput
      {...other}
      ref={(ref) => {
        inputRef(ref ? ref.inputElement : null);
      }}
      mask={[/\d/, " ", /\d/, " ", /\d/]}
      placeholderChar={"_"}
      showMask
    />
  );
}

function AMEXCCVMask(props) {
  const { inputRef, ...other } = props;

  return (
    <MaskedInput
      {...other}
      ref={(ref) => {
        inputRef(ref ? ref.inputElement : null);
      }}
      mask={[/\d/, " ", /\d/, " ", /\d/, " ", /\d/]}
      placeholderChar={"_"}
      showMask
    />
  );
}

function ZipMask(props) {
  const { inputRef, ...other } = props;

  return (
    <MaskedInput
      {...other}
      ref={(ref) => {
        inputRef(ref ? ref.inputElement : null);
      }}
      mask={[/\d/, " ", /\d/, " ", /\d/, " ", /\d/, " ", /\d/]}
      placeholderChar={"_"}
      showMask
    />
  );
}

function PhoneMask(props) {
  const { inputRef, ...other } = props;

  return (
    <MaskedInput
      {...other}
      ref={(ref) => {
        inputRef(ref ? ref.inputElement : null);
      }}
      mask={[
        "+",
        "1",
        " ",
        "(",
        " ",
        /\d/,
        " ",
        /\d/,
        " ",
        /\d/,
        " ",
        ")",
        " ",
        /\d/,
        " ",
        /\d/,
        " ",
        /\d/,
        " ",
        "-",
        " ",
        /\d/,
        " ",
        /\d/,
        " ",
        /\d/,
        " ",
        /\d/,
      ]}
      placeholderChar={"_"}
      showMask
    />
  );
}

export {
  AMEXCreditCardMask,
  CreditCardMask,
  ExpireMask,
  CCVMask,
  PhoneMask,
  ZipMask,
  AMEXCCVMask,
};
