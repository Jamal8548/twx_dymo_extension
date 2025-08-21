TW.Runtime.Widgets.DymoMini = function () {
  var thiz = this;
  var sdkReady = false;
  
  // Relative path per ThingWorx docs:
  // ../Common/extensions/<ExtensionPackageName>/ui/<WidgetName>/jslibrary/<file>
  var DYMO_SRC = "../Common/extensions/DymoMini_ExtensionPackage/ui/DymoMini/jslibrary/dymo.connect.framework.js";

  // ---------- helpers ---------- 
  function setOut(prop, val) { try { thiz.setProperty(prop, val); } catch(e){} }
  function fire(evt) { try { thiz.jqElement && thiz.jqElement.triggerHandler && thiz.jqElement.triggerHandler(evt); } catch(e){} }
  function fail(err) {
    setOut('lastError', (err && err.message) ? err.message : String(err || 'Unknown error'));
    fire('Failed');
  }

  function ensureSdkLoaded() {
    return new Promise(function (resolve, reject) {
      if (window.dymo && dymo.label && dymo.label.framework) return resolve();

      var s = document.createElement('script');
      s.src = DYMO_SRC;
      s.onload = function () { resolve(); };
      s.onerror = function () { reject(new Error('Failed to load DYMO SDK from ' + DYMO_SRC)); };
      document.head.appendChild(s);
    });
  }

  function initFramework() {
    return new Promise(function (resolve, reject) {
      try {
        if (sdkReady) return resolve();
        if (!window.dymo || !dymo.label || !dymo.label.framework)
          return reject(new Error('DYMO SDK not available'));
        if (dymo.label.framework.init) dymo.label.framework.init();
        sdkReady = true;
        setOut('ready', true);
        fire('Ready');
        resolve();
      } catch (e) { reject(e); }
    });
  }

  function initIfNeeded() {
    return ensureSdkLoaded().then(initFramework);
  }

  // ---------- services ----------
  // this.Initialize = function () {
  //   initIfNeeded().catch(fail);
  // };

this.CheckEnvironment = function () {
  console.log("[DymoPrinter] CheckEnvironment called");
  initIfNeeded()
    .then(function () {
      const env = dymo.label.framework.checkEnvironment();
      console.log("[DymoPrinter] Environment checked:", env);
      setOut("environmentJson", JSON.stringify(env || {}));
      fire("EnvironmentChecked");
    })
    .catch(fail);
};


this.GetPrinters = function () {
  console.log("[DymoPrinter] GetPrinters called");
  initIfNeeded()
    .then(async function () {
      const printers = await dymo.label.framework.getPrinters() || [];
      console.log("[DymoPrinter] Printers fetched, count:", printers.length);

      setOut("printersJson", JSON.stringify(printers));

      // Auto-pick first printer if none set
      if (!thiz.getProperty("printerName") && printers.length) {
        const picked = printers[0].name || "";
        console.log("[DymoPrinter] No printer selected, auto-picked:", picked);
        setOut("printerName", picked);
      }

      fire("PrintersFetched");
    })
    .catch(fail);
};


//  Called whenever a bound property changes
this.updateProperty = function (updatePropertyInfo) {
  try {
    const { TargetProperty, SinglePropertyValue } = updatePropertyInfo;

    switch (TargetProperty) {
      case "labelXml":
        this.setProperty("labelXml", SinglePropertyValue);
        console.log("[DymoPrinter] labelXml updated (length):", SinglePropertyValue ? SinglePropertyValue.length : 0);
        // Optional: auto-render when label changes
        // this.RenderLabel();
        break;

      case "printerName":
        this.setProperty("printerName", SinglePropertyValue);
        console.log("[DymoPrinter] printerName updated:", SinglePropertyValue);
        break;

      case "renderParamsXml":
        this.setProperty("renderParamsXml", SinglePropertyValue);
        console.log("[DymoPrinter] renderParamsXml updated");
        break;

      default:
        console.log("[DymoPrinter] Unhandled property update:", TargetProperty);
    }
  } catch (e) {
    console.error("[DymoPrinter] updateProperty error:", e);
  }
};


this.RenderLabel = function () {
  initIfNeeded()
    .then(async function () {
      console.log("[DymoPrinter] RenderLabel invoked");

      let labelXml = thiz.getProperty('labelXml');
      let renderParamsXml = thiz.getProperty('renderParamsXml') || null;
      let printerName     = thiz.getProperty('printerName') || null;

      if (!labelXml) {
          const err = new Error("[DymoPrinter] labelXml is empty");
          console.error(err.message, err); 
          throw err; 
        }

      labelXml = labelXml.replace(/^\uFEFF/, '');
      console.log("[DymoPrinter] Rendering label preview with params:", {
        hasLabelXml: !!labelXml,
        renderParamsXml,
        printerName
      });

      let dataUrl = await dymo.label.framework.renderLabel(labelXml, renderParamsXml, printerName);
      console.log("[DymoPrinter] Raw render result length:", dataUrl ? dataUrl.length : 0);

      if (dataUrl && !dataUrl.startsWith("data:")) {
        dataUrl = "data:image/png;base64," + dataUrl;
        console.log("[DymoPrinter] Added data:image/png;base64 prefix");
      }

      setOut("previewDataUrl", dataUrl || "");
      console.log("[DymoPrinter] Preview image ready, event fired");
      fire('Rendered');
    })
    .catch(err => {
      console.error("[DymoPrinter] RenderLabel failed:", err);
      fail(err);
    });
};

 
 // PrintLabel uses GetPrinters logic as fallback
this.PrintLabel = () => {
  initIfNeeded()
    .then(async () => {
      console.log("[DymoPrinter] PrintLabel invoked");

      let labelXml = this.getProperty('labelXml');
      if (!labelXml) throw new Error('[DymoPrinter] labelXml is empty');
      labelXml = labelXml.replace(/^\uFEFF/, '');

      const labelSetXml    = this.getProperty('labelSetXml')    || null;
      const printParamsXml = this.getProperty('printParamsXml') || null;
      let printerName      = this.getProperty('printerName');

      // If no printer selected, fetch and auto-pick first
      if (!printerName) {
        console.log("[DymoPrinter] No printer specified, fetching available printers...");
        const printers = await dymo.label.framework.getPrinters() || [];
        if (printers.length) {
          printerName = printers[0].name;
          setOut('printerName', printerName); // update property
          console.log("[DymoPrinter] Auto-selected printer:", printerName);
        } else {
          throw new Error('[DymoPrinter] No printers available');
        }
      }

      console.log("[DymoPrinter] Sending job to printer:", {
        printerName,
        printParamsXml,
        hasLabelXml: !!labelXml,
        hasLabelSetXml: !!labelSetXml
      });

      await dymo.label.framework.printLabel(printerName, printParamsXml, labelXml, labelSetXml);
      console.log("[DymoPrinter] Print job sent successfully");
      fire('Printed');
    })
    .catch(err => {
      console.error("[DymoPrinter] PrintLabel failed:", err);
      fail(err);
    });
};


  // Optional generic dispatcher
this.serviceInvoked = function (name) {
    //if (name === 'Initialize')       return thiz.Initialize();
    if (name === 'CheckEnvironment') return thiz.CheckEnvironment();
    if (name === 'GetPrinters')      return thiz.GetPrinters();
    if (name === 'RenderLabel')      return thiz.RenderLabel();
    if (name === 'PrintLabel')       return thiz.PrintLabel();
  };



this.afterRender = function () {
  console.log("[DymoPrinter] afterRender called, initializing SDK...");

  initIfNeeded()
    .then(function () {
      try {
        if (dymo.label.framework.checkEnvironment) {
          const env = dymo.label.framework.checkEnvironment();
          console.log("[DymoPrinter] Environment check result:", env);
        }
      } catch (err) {
        console.warn("[DymoPrinter] Environment check skipped:", err.message);
      }
    })
    .catch(function (e) {
      console.error("[DymoPrinter] SDK initialization failed:", e);
      // Don’t spam UI; normal services will report errors
    });
};


this.renderHtml = function () {
    console.log("[DymoPrinter] renderHtml executed  widget rendered");
    return '<div class="widget-content dymo-mini-widget"></div>';
  };
};



