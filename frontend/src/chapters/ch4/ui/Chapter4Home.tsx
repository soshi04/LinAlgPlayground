import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const PLACEHOLDER_MODULES = ["Vector spaces", "Linear independence", "Span", "Subspaces"];

interface Props {
  chapterId: string;
  title: string;
  description: string;
}

export function Chapter4Home({ title, description }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <p className="text-muted-foreground mt-1">{description}</p>
      </div>
      <Separator />
      <Card>
        <CardHeader>
          <CardTitle>Coming soon</CardTitle>
          <CardDescription>Planned modules for this chapter</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
            {PLACEHOLDER_MODULES.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
