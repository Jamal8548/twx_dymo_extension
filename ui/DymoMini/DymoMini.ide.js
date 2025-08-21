TW.IDE.Widgets.DymoMini = function () {

  this.widgetProperties = function () {
    return {
      name: 'DymoMini',
      description: 'DYMO Connect printing (mini widget)',
      category: ['Common'],
      defaultBindingTargetProperty: 'previewDataUrl',
      properties: {
        // Inputs
        labelXml:        { baseType: 'STRING',  description: 'DYMO label XML',                   isBindingTarget: true },
        labelSetXml:     { baseType: 'STRING',  description: 'LabelSet XML (optional)',          isBindingTarget: true },
        printParamsXml:  { baseType: 'STRING',  description: 'Print params XML (optional)',      isBindingTarget: true },
        renderParamsXml: { baseType: 'STRING',  description: 'Render params XML (optional)',     isBindingTarget: true },
        printerName:     { baseType: 'STRING',  description: 'Target printer name',              isBindingTarget: true, isBindingSource: true },

        // Outputs
        ready:           { baseType: 'BOOLEAN', description: 'SDK initialized',                   isBindingSource: true },
        printersJson:    { baseType: 'STRING',  description: 'JSON array of printers',            isBindingSource: true },
        environmentJson: { baseType: 'STRING',  description: 'Environment check result (JSON)',   isBindingSource: true },
        previewDataUrl:  { baseType: 'STRING',  description: 'Rendered label (data URL)',         isBindingSource: true },
        lastError:       { baseType: 'STRING',  description: 'Last error message',                isBindingSource: true }
      }
    };
  };

  this.widgetServices = function () {
    return {
      //Initialize:       { description: 'Load DYMO SDK and initialize' },
      CheckEnvironment: { description: 'dymo.label.framework.checkEnvironment()' },
      GetPrinters:      { description: 'dymo.label.framework.getPrinters()' },
      RenderLabel:      { description: 'Render preview image (sets previewDataUrl)' },
      PrintLabel:       { description: 'Print using current properties' }
    };
  };

  this.widgetEvents = function () {
    return {
      Ready:              { description: 'SDK initialized and ready' },
      Failed:             { description: 'An operation failed' },
      EnvironmentChecked: { description: 'Environment info available' },
      PrintersFetched:    { description: 'Printers list available' },
      Rendered:           { description: 'Preview rendered' },
      Printed:            { description: 'Print job sent' }
    };
  };

  this.renderHtml = function () {
    return '<div class="widget-content dymo-mini-widget">🪟</div>';
  };

  this.afterRender = function () {};
};
