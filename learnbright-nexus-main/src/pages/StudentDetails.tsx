import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { z } from "zod";
import { api, type Student, type StudentInput } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  ArrowLeft, Edit2, Trash2, Save, X, Loader2, Mail, Phone, MapPin, Hash,
  Building2, GraduationCap, Calendar, FileText, Sparkles, User,
} from "lucide-react";
import { TechBackground } from "@/components/TechBackground";
import { Starfield } from "@/components/Starfield";

const studentSchema = z.object({
  name: z.string().trim().min(1, "Name required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  course: z.string().trim().min(1, "Course required").max(100),
  college: z.string().trim().max(150).optional(),
  phone: z.string().trim().max(30).optional(),
  roll_no: z.string().trim().max(50).optional(),
  location: z.string().trim().max(150).optional(),
  age: z.number().int().min(5).max(120).optional().nullable(),
  notes: z.string().max(1000).optional(),
});

const RECOMMENDATIONS: Record<string, string[]> = {
  "Computer Science": ["Master Data Structures & Algorithms", "Build full-stack projects", "Contribute to open source", "Practice system design weekly"],
  "Mathematics": ["Practice proof writing", "Explore Linear Algebra deeply", "Try competitive math", "Read original papers"],
  "Physics": ["Solve Irodov problems", "Run simulations in Python", "Read original papers", "Join a research lab"],
  "Business": ["Study real case studies", "Learn financial modeling", "Build a side venture", "Network with founders"],
  "Design": ["Build a portfolio site", "Master Figma + prototyping", "Study design systems", "Daily UI exercises"],
  default: ["Set weekly learning goals", "Join study groups", "Build a personal project", "Document your learnings"],
};

const StudentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", course: "", college: "", phone: "",
    roll_no: "", location: "", age: "", notes: "",
  });

  useEffect(() => {
    if (!id) return;
    api.getStudent(id)
      .then((s) => {
        setStudent(s);
        setForm({
          name: s.name, email: s.email, course: s.course,
          college: s.college || "", phone: s.phone || "",
          roll_no: s.roll_no || "", location: s.location || "",
          age: s.age?.toString() || "", notes: s.notes || "",
        });
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    const parsed = studentSchema.safeParse({
      name: form.name, email: form.email, course: form.course,
      college: form.college || undefined, phone: form.phone || undefined,
      roll_no: form.roll_no || undefined, location: form.location || undefined,
      age: form.age ? parseInt(form.age) : null,
      notes: form.notes || undefined,
    });
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }
    setSaving(true);
    const d = parsed.data;
    const payload: StudentInput = {
      name: d.name, email: d.email, course: d.course,
      college: d.college || null, phone: d.phone || null,
      roll_no: d.roll_no || null, location: d.location || null,
      age: d.age ?? null, notes: d.notes || null,
    };
    try {
      const updated = await api.updateStudent(id, payload);
      setStudent(updated);
      setEditing(false);
      toast.success("Student updated");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await api.deleteStudent(id);
      toast.success("Student deleted");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen hero-bg relative flex items-center justify-center">
        <TechBackground />
        <Loader2 className="w-10 h-10 animate-spin text-primary relative z-10" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen hero-bg relative flex items-center justify-center">
        <TechBackground />
        <Card className="glass border-0 p-12 text-center relative z-10">
          <p className="text-muted-foreground mb-4">Student not found.</p>
          <Button onClick={() => navigate("/dashboard")}>Back to dashboard</Button>
        </Card>
      </div>
    );
  }

  const initials = student.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const recs = RECOMMENDATIONS[student.course] || RECOMMENDATIONS.default;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen hero-bg relative pb-12"
    >
      <TechBackground />
      <Starfield />

      <header className="sticky top-0 z-30 glass border-b border-border/50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all hover:-translate-x-1">
            <ArrowLeft className="w-4 h-4" /> Back to dashboard
          </Link>
          <div className="flex items-center gap-2">
            {!editing ? (
              <>
                <Button onClick={() => setEditing(true)} variant="outline" className="gap-2">
                  <Edit2 className="w-4 h-4" /> Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="gap-2">
                      <Trash2 className="w-4 h-4" /> Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="glass border-0">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete student?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete <strong>{student.name}</strong>. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            ) : (
              <Button variant="ghost" onClick={() => setEditing(false)} className="gap-2">
                <X className="w-4 h-4" /> Cancel
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 relative z-10 max-w-5xl">
        {/* Hero card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass border-0 p-8 mb-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <motion.div
                animate={{ boxShadow: ["0 0 20px hsl(var(--primary)/0.4)", "0 0 50px hsl(var(--primary)/0.8)", "0 0 20px hsl(var(--primary)/0.4)"] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="rounded-2xl"
              >
                <Avatar className="w-24 h-24 ring-2 ring-primary/30">
                  <AvatarFallback className="gradient-bg text-white text-3xl font-display">{initials}</AvatarFallback>
                </Avatar>
              </motion.div>
              <div className="flex-1">
                <h1 className="text-3xl font-display font-bold mb-2">{student.name}</h1>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge className="gradient-bg border-0 text-sm">{student.course}</Badge>
                  {student.roll_no && <Badge variant="outline" className="gap-1"><Hash className="w-3 h-3" />{student.roll_no}</Badge>}
                  {student.age && <Badge variant="outline">Age {student.age}</Badge>}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" /> {student.email}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {editing ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="glass border-0 p-6">
              <h2 className="font-display font-semibold text-xl mb-4">Edit Student</h2>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
                  <div><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
                  <div><Label>Course *</Label><Input value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} required /></div>
                  <div><Label>College</Label><Input value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} /></div>
                  <div><Label>Roll No</Label><Input value={form.roll_no} onChange={(e) => setForm({ ...form, roll_no: e.target.value })} /></div>
                  <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                  <div><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
                  <div><Label>Age</Label><Input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} /></div>
                </div>
                <div><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={4} /></div>
                <Button type="submit" disabled={saving} className="gradient-bg border-0 shadow-glow gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save changes</>}
                </Button>
              </form>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid md:grid-cols-2 gap-4"
          >
            <DetailRow icon={User} label="Full Name" value={student.name} />
            <DetailRow icon={Mail} label="Email" value={student.email} />
            <DetailRow icon={GraduationCap} label="Course" value={student.course} />
            <DetailRow icon={Building2} label="College" value={student.college} />
            <DetailRow icon={Hash} label="Roll Number" value={student.roll_no} />
            <DetailRow icon={Phone} label="Phone" value={student.phone} />
            <DetailRow icon={MapPin} label="Location" value={student.location} />
            <DetailRow icon={Calendar} label="Age" value={student.age?.toString()} />

            {student.notes && (
              <Card className="glass border-0 p-5 md:col-span-2">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  <FileText className="w-3 h-3" /> Notes
                </div>
                <p className="text-sm whitespace-pre-wrap">{student.notes}</p>
              </Card>
            )}

            <Card className="glass border-0 p-5 md:col-span-2">
              <div className="flex items-center gap-2 text-sm font-medium mb-3">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="gradient-text font-semibold">AI Recommendations for {student.course}</span>
              </div>
              <ul className="space-y-2">
                {recs.map((r, i) => (
                  <motion.li
                    key={r}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    className="flex items-start gap-2 text-sm"
                  >
                    <span className="text-primary mt-0.5">→</span>
                    <span>{r}</span>
                  </motion.li>
                ))}
              </ul>
            </Card>

            <Card className="glass border-0 p-5 md:col-span-2 text-xs text-muted-foreground">
              Created {new Date(student.created_at).toLocaleString()} • Last updated {new Date(student.updated_at).toLocaleString()}
            </Card>
          </motion.div>
        )}
      </main>
    </motion.div>
  );
};

const DetailRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: string | null | undefined }) => (
  <Card className="glass border-0 p-5 hover:shadow-elegant transition-all hover:-translate-y-0.5">
    <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-2">
      <Icon className="w-3 h-3" /> {label}
    </div>
    <p className="font-medium text-base">{value || <span className="text-muted-foreground/60 italic">Not provided</span>}</p>
  </Card>
);

export default StudentDetails;
