import React, { useMemo } from "react";
import { Wrapper, Link } from "./Footer.css";

function Footer() {
  const year = useMemo(() => new Date().getFullYear(), []);
  return (
    <Wrapper>
      Copyright © All rights reserved {year} @ PCIHIPAA |{" "}
      <Link href="http://pcihipaa.com/privacy-policy/">Privacy Policy</Link> |{" "}
      <Link href="http://pcihipaa.com/terms-of-use/">Terms of Use</Link>
    </Wrapper>
  );
}

export { Footer };
