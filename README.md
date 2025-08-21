# **DYMO Label Printer Extension for ThingWorx**

This extension integrates DYMO Label Framework into ThingWorx, enabling mashups and experiences to:

Detect DYMO environment

Fetch available printers

Render label previews

Send print jobs

## **📦 Installation**
1.  ## Download 
[📥 Download Extension ZIP](https://github.com/Jamal8548/twx_dymo_extension/raw/master/Dymo_ThingworxExtension.zip) 


2. In **ThingWorx Composer**:
   - Go to **Import/Export** → **Import**.
   - Select the `.zip` file.
   - Click **Import**.

3. The widget will now be available in the **Widgets** panel in Mashup Builder.

 ## **🚀 Features *

Check DYMO environment availability

Retrieve available printers (auto-select first printer if none chosen)

Render label previews as base64 images

Print labels directly from ThingWorx

Events for completion, cancellation, popup blocked

 ## **📂 Services**
🔹 CheckEnvironment

Checks if the DYMO Label Framework is available.

Output: environmentJson → JSON string with DYMO environment details

Events Fired: EnvironmentChecked

 ## **🔹 GetPrinters**

Fetches all available DYMO printers.

Output: printersJson → JSON string containing printer objects

Auto-Selects: First printer if none is set

Events Fired: PrintersFetched

## **🔹 RenderLabel**

Renders a DYMO label to a base64-encoded PNG preview.

Inputs:

labelXml – DYMO label XML string

renderParamsXml – (Optional) rendering parameters

printerName – (Optional) printer name

Output: previewDataUrl → data:image/png;base64,... string

Events Fired: Rendered

 ## **🔹 PrintLabel**

Sends a print job to the DYMO printer.

Inputs:

printerName – DYMO printer name (auto-selected if empty)

labelXml – Label XML definition

labelSetXml – (Optional) dataset for labels

printParamsXml – (Optional) print parameters

Events Fired: Printed

## **⚡ Event**

EnvironmentChecked → Fired after environment check

PrintersFetched → Fired after fetching printers

Rendered → Fired after rendering preview

Printed → Fired after print job

PopupDone → Fired when popup completes successfully

PopupCanceled → Fired when popup is canceled

PopupBlocked → Fired when popup is blocked

## **⚙️ Properties**
 
printerName → Default printer to use (auto-selected if empty)

labelXml → Label definition in DYMO XML format

labelSetXml → (Optional) data source for labels

printParamsXml → (Optional) parameters for printing

renderParamsXml → (Optional) parameters for rendering
