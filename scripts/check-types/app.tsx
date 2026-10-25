// Consommateur bundler (Vite, Next, webpack) : JSX et types publics.
import { BarChart, PrimaryButton, Sidebar, type SidebarUser } from "@ddaoellena/cadence-ui";

const user: SidebarUser = { name: "Hector Malot" };
export const App = () => (
  <>
    <Sidebar product="datahub" clientName="Bordeaux" sections={[]} user={user} />
    <PrimaryButton label="Créer" />
    <BarChart title="Perturbations" categories={["lun."]} series={[{ id: "s", label: "Travaux", data: [3] }]} />
  </>
);
