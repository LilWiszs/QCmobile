import React from "react";

export default function Footer({year, systemName}) {
  return (
    <footer>
      <p>© {year} {systemName}</p>
    </footer>
  );
}
