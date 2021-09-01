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
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all(loadScripts()).then(() => {
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!loaded) return;
    console.log("Loading Viewer view");
    console.log("Creating the report viewer with default options");

    window.StiOptions.WebServer.url = "/api/handler";
    const viewer = new window.Stimulsoft.Viewer.StiViewer(
      null,
      "StiViewer",
      false
    );

    console.log("Creating a new report instance");

    const report = new window.Stimulsoft.Report.StiReport();

    console.log("Load report from url");

    report.loadFile("/reports/PayrollRegister.mrt");

    report.dictionary.variables.getByName("ReportName").valueObject =
      "Payroll Register";

    report.dictionary.variables.getByName("CompanyId").valueObject = 1;

    console.log(
      "Assigning report to the viewer, the report will be built automatically after rendering the viewer"
    );

    viewer.report = report;
    console.log("Rendering the viewer to selected element");
    viewer.renderHtml("viewer");
  }, [loaded]);

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
        <h1>Report 2</h1>
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

      <div id="viewer" />
    </div>
  );
}
