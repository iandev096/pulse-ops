import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AbbreviationProps {
  abbr: string;
  fullText: string;
  className?: string;
}

export function Abbreviation({ abbr, fullText, className }: AbbreviationProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={className} style={{ cursor: "help" }}>
          {abbr}
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p>{fullText}</p>
      </TooltipContent>
    </Tooltip>
  );
}
