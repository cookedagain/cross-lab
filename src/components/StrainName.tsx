type StrainNameProps = {
  name: string;
  className?: string;
};

// Splits a strain name on the cross separator so each parent sits on its own line.
const splitName = (name: string) =>
  name
    .split("×")
    .map((part) => part.trim())
    .filter(Boolean);

const StrainName = ({ name, className }: StrainNameProps) => {
  const parts = splitName(name);

  if (parts.length <= 1) {
    return <span className={className}>{name}</span>;
  }

  return (
    <span className={`flex flex-col gap-0.5 ${className ?? ""}`}>
      {parts.map((part, index) => (
        <span key={`${part}-${index}`} className="contents">
          <span>{part}</span>
          {index < parts.length - 1 && (
            <span className="text-xs font-black leading-none text-muted-foreground">×</span>
          )}
        </span>
      ))}
    </span>
  );
};

export default StrainName;