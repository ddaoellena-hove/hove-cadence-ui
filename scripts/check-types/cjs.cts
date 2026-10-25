// Consommateur CommonJS (node16 / nodenext) : require() et types publics.
import lib = require("@ddaoellena/cadence-ui");

const props: lib.PrimaryButtonProps = { icon: "trash", "aria-label": "Supprimer" };
export = [lib.PrimaryButton, lib.BarChart, props];
