/* eslint-disable @next/next/no-css-tags */
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useEffect, useState } from "react";
import Link from "next/link";

const scripts = [
  "/stimulsoft/stimulsoft.reports.js",
  "/stimulsoft/stimulsoft.viewer.js",
];

function loadScript(script) {
  return new Promise((resolve, reject) => {
    const scriptTag = document.createElement("script");
    scriptTag.src = script;
    scriptTag.addEventListener("load", resolve);
    document.getElementsByTagName("head")[0].appendChild(scriptTag);
  });
}

function loadScripts() {
  const promises = [];

  scripts.forEach((script) => {
    promises.push(loadScript(script));
  });

  return promises;
}

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Report Viewer</title>
        <link
          rel="stylesheet"
          href="/stimulsoft/stimulsoft.viewer.office2013.whiteblue.css"
        />
      </Head>
      <div className={styles.menus}>
        <h1>Index Page</h1>
        <Link href="/">
          <a style={{ marginLeft: "30px" }}>Index</a>
        </Link>
        <Link href="/report1">
          <a style={{ marginLeft: "30px" }}>Report 1</a>
        </Link>
        <Link href="/report2">
          <a style={{ marginLeft: "30px" }}>Report 2</a>
        </Link>
        <Link href="/report3">
          <a style={{ marginLeft: "30px" }}>Report 3</a>
        </Link>
      </div>
    </div>
  );
}
