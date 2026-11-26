import t from "@/data/surgical-catalog.json";

function a(e) {
  return `${e.brand}\u001e${e.system}`;
}
export { t as SURGICAL_CATALOG };
export function resolveSurgicalCatalog(e) {
  return (
    (function (e) {
      if (e) {
        return t.find((t) => a(t) === e);
      }
    })(e) ?? t[0]
  );
}
export { a as surgicalCatalogKey };
