import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface QuizItem {
  id: string;
  question: string;
  options: { label: string; correct: boolean; explanation: string }[];
}

const QUIZ_ITEMS: QuizItem[] = [
  {
    id: "q1",
    question: "Is T(x) = Ax (where A is a fixed matrix) a linear transformation?",
    options: [
      {
        label: "Yes",
        correct: true,
        explanation:
          "Matrix multiplication preserves addition and scalar multiplication: A(u+v) = Au+Av and A(cv) = c(Av).",
      },
      {
        label: "No",
        correct: false,
        explanation:
          "Actually, yes! Matrix multiplication is the prototypical linear transformation.",
      },
    ],
  },
  {
    id: "q2",
    question: "Is T(x) = Ax + b (with b ≠ 0) a linear transformation?",
    options: [
      {
        label: "Yes",
        correct: false,
        explanation:
          "No — T(0) = b ≠ 0. A linear transformation must send the zero vector to the zero vector. This is an affine map.",
      },
      {
        label: "No",
        correct: true,
        explanation:
          "Correct! T(0) = b ≠ 0, violating the requirement that T(0) = 0. This is affine, not linear.",
      },
    ],
  },
  {
    id: "q3",
    question: "Is T(x) = ‖x‖ · x a linear transformation?",
    options: [
      {
        label: "Yes",
        correct: false,
        explanation:
          "No — T(2x) = ‖2x‖(2x) = 2‖x‖(2x) = 4‖x‖x ≠ 2T(x) = 2‖x‖x. Scalar multiplication is not preserved.",
      },
      {
        label: "No",
        correct: true,
        explanation:
          "Correct! T(2x) = 4‖x‖x but 2T(x) = 2‖x‖x — they differ, so T is not linear.",
      },
    ],
  },
  {
    id: "q4",
    question: "If A is 3×2 and B is 2×4, is AB defined? What size is it?",
    options: [
      {
        label: "Yes, 3×4",
        correct: true,
        explanation:
          "A has 2 columns, B has 2 rows — inner dimensions match. Result is 3×4.",
      },
      {
        label: "Yes, 2×2",
        correct: false,
        explanation:
          "The result is #rows(A) × #cols(B) = 3×4, not 2×2.",
      },
      {
        label: "Not defined",
        correct: false,
        explanation:
          "It IS defined because #cols(A) = 2 = #rows(B).",
      },
    ],
  },
  {
    id: "q5",
    question:
      "A 2×2 matrix A has ad − bc = 0. Is A invertible?",
    options: [
      {
        label: "Yes",
        correct: false,
        explanation:
          "No! A 2×2 matrix is invertible if and only if ad−bc ≠ 0.",
      },
      {
        label: "No",
        correct: true,
        explanation:
          "Correct. For 2×2, invertibility ⟺ det = ad−bc ≠ 0. Since det = 0, A is singular.",
      },
    ],
  },
];

export function MiniQuiz() {
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  const select = (qId: string, optIdx: number) => {
    setAnswers((prev) => ({ ...prev, [qId]: optIdx }));
    setRevealed((prev) => new Set(prev).add(qId));
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Quick conceptual checks — no backend needed. Pick an answer and see the explanation.
      </p>
      {QUIZ_ITEMS.map((q) => {
        const chosen = answers[q.id];
        const isRevealed = revealed.has(q.id);
        return (
          <Card key={q.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{q.question}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex gap-2 flex-wrap">
                {q.options.map((opt, oi) => (
                  <Button
                    key={oi}
                    size="sm"
                    variant={chosen === oi ? "default" : "outline"}
                    className={cn(
                      isRevealed && chosen === oi && opt.correct && "bg-green-600 hover:bg-green-700",
                      isRevealed && chosen === oi && !opt.correct && "bg-red-600 hover:bg-red-700"
                    )}
                    onClick={() => select(q.id, oi)}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
              {isRevealed && chosen != null && (
                <div className="rounded border p-3 text-sm">
                  <Badge
                    variant={q.options[chosen].correct ? "success" : "destructive"}
                    className="mb-1"
                  >
                    {q.options[chosen].correct ? "Correct" : "Incorrect"}
                  </Badge>
                  <p className="text-muted-foreground mt-1">
                    {q.options[chosen].explanation}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
