import { ReactNode } from "react";

export default function OfflinePanel({
  icon = "📡",
  title = "Convex backend not connected",
  children,
  cta,
}: {
  icon?: string;
  title?: string;
  children?: ReactNode;
  cta?: ReactNode;
}) {
  return (
    <div className="wrap" style={{ paddingTop: 150, paddingBottom: 80 }}>
      <div className="panel">
        <div className="big">{icon}</div>
        <h2>{title}</h2>
        <p>
          {children ??
            "This page is powered by the Convex database. Start the local backend and seed the real tournament data to see it live here."}
        </p>
        <code>npx convex dev</code>
        {cta ? <div style={{ marginTop: 4 }}>{cta}</div> : null}
      </div>
    </div>
  );
}
