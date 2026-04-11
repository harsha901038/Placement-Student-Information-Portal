import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export default function AdminRollNumbers() {
  const [input, setInput] = useState("");
  const [prefix, setPrefix] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [groupedRolls, setGroupedRolls] = useState({});

  useEffect(() => {
  fetch("http://https://placement-student-information-portal.onrender.com/api/admin/rolls-by-branch")
    .then(res => res.json())
    .then(data => setGroupedRolls(data))
    .catch(err => console.log(err));
}, []);

  const handleGenerate = () => {
    const s = parseInt(start);
    const e = parseInt(end);
    if (!prefix || isNaN(s) || isNaN(e) || s > e) {
      toast({ title: "Please enter valid values", variant: "destructive" });
      return;
    }
    const rolls = [];
    for (let i = s; i <= e; i++) {
      rolls.push(`${prefix}${String(i).padStart(2, "0")}`);
    }
    setInput(rolls.join("\n"));
  };

  const handleUpload = async () => {
    const rollNumbers = input
      .split("\n")
      .map(r => r.trim())
      .filter(r => r.length > 0);

    if (rollNumbers.length === 0) {
      toast({ title: "Please enter roll numbers", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://https://placement-student-information-portal.onrender.com/api/admin/roll-numbers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rollNumbers })
      });
      const data = await res.json();
      toast({ title: `${rollNumbers.length} roll numbers uploaded successfully ` });
      setInput("");

const res2 = await fetch("http://https://placement-student-information-portal.onrender.com/api/admin/rolls-by-branch");
const newData = await res2.json();
setGroupedRolls(newData);
    } catch (err) {
      toast({ title: "Upload failed", variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Manage Roll Numbers</h1>
          <p className="text-gray-500 mt-1">Only valid roll numbers can register on the portal</p>
        </div>

        {/* RANGE GENERATOR */}
        <Card className="rounded-2xl shadow">
          <CardHeader>
            <CardTitle>Generate by Range</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-sm text-gray-500 mb-1">Prefix</p>
                <Input
                  placeholder="21B01A05"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Start Number</p>
                <Input
                  type="number"
                  placeholder="1"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">End Number</p>
                <Input
                  type="number"
                  placeholder="60"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                />
              </div>
            </div>
            <Button
              onClick={handleGenerate}
              variant="outline"
              className="w-full"
            >
              Generate Roll Numbers
            </Button>
          </CardContent>
        </Card>

        {/* MANUAL + UPLOAD */}
        <Card className="rounded-2xl shadow">
          <CardHeader>
            <CardTitle>Upload Roll Numbers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              rows={10}
              placeholder={"21B01A0501\n21B01A0502\n21B01A0503\n..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="font-mono"
            />
            <p className="text-sm text-gray-500">
              {input.split("\n").filter(r => r.trim()).length} roll numbers ready to upload
            </p>
            <Button
              onClick={handleUpload}
              disabled={loading}
              className="bg-blue-600 text-white hover:bg-blue-700 w-full"
            >
              {loading ? "Uploading..." : "Upload Roll Numbers"}
            </Button>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow">
  <CardHeader>
    <CardTitle>Branch-wise Roll Numbers</CardTitle>
  </CardHeader>

  <CardContent className="space-y-4">
    {Object.keys(groupedRolls).map(branch => (
      <div key={branch}>
        <h2 className="text-lg font-semibold mb-2">{branch}</h2>

        <div className="flex flex-wrap gap-2">
          {groupedRolls[branch]?.sort().map((roll, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
            >
              {roll}
            </span>
          ))}
        </div>
      </div>
    ))}
  </CardContent>
</Card>
      </div>
    </AppLayout>
  );
}