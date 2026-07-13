import { ReactNode } from "react";

interface PageHeaderProps {
  title: ReactNode;
  lead?: string;
  action?: ReactNode;
  align?: "left" | "center";
}

export default function PageHeader({ title, lead, action, align = "left" }: PageHeaderProps) {
  const isCenter = align === "center";
  return (
    <div className={`flex ${isCenter ? "flex-col items-center text-center" : "flex-col md:flex-row md:items-end md:justify-between"} gap-4`}>
      <div>
        <h2 className="text-[25px] md:text-h2 font-extrabold tracking-[-0.03em] text-neutral-900">{title}</h2>
        {lead && <p className="text-body md:text-[16px] leading-[1.75] font-medium text-neutral-500 mt-3">{lead}</p>}
      </div>
      {action && !isCenter && <div className="shrink-0">{action}</div>}
    </div>
  );
}
