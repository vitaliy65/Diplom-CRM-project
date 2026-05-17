export function PieCustomTooltip({ active, payload }: any) {
    if (active && payload && payload.length) {
      const { name, value } = payload[0].payload;
      const total = payload[0].payload.total;
      const percent = total
        ? ((value / total) * 100).toFixed(1)
        : "0.0";
      return (
        <div
          style={{
            backgroundColor: "oklch(0.12 0.008 270)",
            border: "1px solid oklch(0.25 0.01 270)",
            borderRadius: "12px",
            fontSize: "12px",
            padding: 8,
            color: "oklch(0.95 0 0)",
          }}
        >
          <div style={{ fontWeight: 600 }}>{name}</div>
          <div>
            {value} заявок ({percent}
            %)
          </div>
        </div>
      );
    }
    return null;
  }