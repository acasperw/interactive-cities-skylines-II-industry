import { ReactFlowProvider } from "@xyflow/react";
import { FlowChart } from "./components/FlowChart";
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  type Category,
} from "./data/industries";

export default function App() {
  return (
    <div className="app">
      <header className="app__header">
        <h1>Cities: Skylines II — Industry Flow</h1>
        <p>Click any item to trace its full production chain. Click the background to reset.</p>
        <div className="legend" style={{ marginLeft: "auto" }}>
          {(Object.keys(CATEGORY_LABELS) as Category[]).map((c) => (
            <span key={c}>
              <i style={{ background: CATEGORY_COLORS[c] }} />
              {CATEGORY_LABELS[c]}
            </span>
          ))}
        </div>
      </header>
      <main className="app__flow">
        <ReactFlowProvider>
          <FlowChart />
        </ReactFlowProvider>
      </main>
    </div>
  );
}
