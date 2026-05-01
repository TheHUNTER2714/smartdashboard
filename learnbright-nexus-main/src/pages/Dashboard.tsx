import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { api, type Student, type StudentInput } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { GraduationCap, Plus, Search, Edit2, Trash2, Loader2, Sun, Moon, LogOut, Sparkles, Users, BookOpen, TrendingUp, Phone, MapPin, Hash, Building2, Eye } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from "recharts";
import { Starfield } from "@/components/Starfield";
import { TechBackground } from "@/components/TechBackground";

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

const COLORS = ["hsl(262 83% 58%)", "hsl(280 90% 70%)", "hsl(195 90% 55%)", "hsl(330 80% 60%)", "hsl(160 70% 50%)", "hsl(40 90% 60%)"];

const RECOMMENDATIONS: Record<string, string[]> = {
  "Computer Science": ["Master Data Structures & Algorithms", "Build full-stack projects", "Contribute to open source"],
  "Mathematics": ["Practice proof writing", "Explore Linear Algebra deeply", "Try competitive math"],
  "Physics": ["Solve Irodov problems", "Run simulations in Python", "Read original papers"],
  "Business": ["Study real case studies", "Learn financial modeling", "Build a side venture"],
  "Design": ["Build a portfolio site", "Master Figma + prototyping", "Study design systems"],
  "default": ["Set weekly learning goals", "Join study groups", "Build a personal project"],
};

const emptyForm = { name: "", email: "", course: "", college: "", phone: "", roll_no: "", location: "", age: "", notes: "" };

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCourse, setFilterCourse] = useState("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewing, setViewing] = useState<Student | null>(null);
  const [editing, setEditing] = useState<Student | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!user) return;
    fetchStudents();
  }, [user]);

  const fetchStudents = async () => {
    try {
      const data = await api.listStudents();
      setStudents(data);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditing(null);
  };

  const openEdit = (s: Student) => {
    setEditing(s);
    setForm({
      name: s.name,
      email: s.email,
      course: s.course,
      college: s.college || "",
      phone: s.phone || "",
      roll_no: s.roll_no || "",
      location: s.location || "",
      age: s.age?.toString() || "",
      notes: s.notes || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = studentSchema.safeParse({
      name: form.name,
      email: form.email,
      course: form.course,
      college: form.college || undefined,
      phone: form.phone || undefined,
      roll_no: form.roll_no || undefined,
      location: form.location || undefined,
      age: form.age ? parseInt(form.age) : null,
      notes: form.notes || undefined,
    });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setSaving(true);

    const d = parsed.data;
    const payload: StudentInput = {
      name: d.name,
      email: d.email,
      course: d.course,
      college: d.college || null,
      phone: d.phone || null,
      roll_no: d.roll_no || null,
      location: d.location || null,
      age: d.age ?? null,
      notes: d.notes || null,
    };

    try {
      if (editing) {
        const updated = await api.updateStudent(editing.id, payload);
        setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
        toast.success("Student updated");
      } else {
        const created = await api.createStudent(payload);
        setStudents((prev) => [created, ...prev]);
        toast.success("Student added");
      }
      setDialogOpen(false);
      resetForm();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this student?")) return;
    try {
      await api.deleteStudent(id);
      setStudents((prev) => prev.filter((s) => s.id !== id));
      toast.success("Deleted");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const courses = useMemo(() => Array.from(new Set(students.map((s) => s.course))), [students]);

  const filtered = useMemo(
    () =>
      students.filter((s) => {
        const q = search.toLowerCase();
        const matchSearch =
          !q ||
          s.name.toLowerCase().includes(q) ||
          s.course.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          (s.roll_no || "").toLowerCase().includes(q) ||
          (s.college || "").toLowerCase().includes(q);
        const matchCourse = filterCourse === "all" || s.course === filterCourse;
        return matchSearch && matchCourse;
      }),
    [students, search, filterCourse]
  );

  const courseData = useMemo(() => {
    const counts: Record<string, number> = {};
    students.forEach((s) => { counts[s.course] = (counts[s.course] || 0) + 1; });
    return Object.entries(counts).map(([course, count]) => ({ course, count }));
  }, [students]);

  const handleSignOut = () => {
    signOut();
    navigate("/");
  };

  const initials = (user?.full_name || user?.email || "U")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen hero-bg relative"
    >
      <TechBackground />
      <Starfield />
      <div className="float-orb w-[400px] h-[400px] bg-primary/20 -top-32 -right-32 fixed" />
      <div className="float-orb w-[300px] h-[300px] bg-accent/20 -bottom-20 -left-20 fixed" style={{ animationDelay: "3s" }} />

      <header className="sticky top-0 z-30 glass border-b border-border/50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg leading-tight">Smart Dashboard</h1>
              <p className="text-xs text-muted-foreground">Student Management</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button size="icon" variant="ghost" onClick={toggle}>
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-10 px-2 gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="gradient-bg text-white text-xs">{initials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="font-medium truncate">{user?.full_name || "User"}</div>
                  <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 relative z-10">
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {[
            { icon: Users, label: "Total Students", value: students.length, color: "from-purple-500 to-pink-500" },
            { icon: BookOpen, label: "Courses", value: courses.length, color: "from-cyan-500 to-blue-500" },
            { icon: TrendingUp, label: "This Month", value: students.filter((s) => new Date(s.created_at).getMonth() === new Date().getMonth()).length, color: "from-emerald-500 to-teal-500" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="glass border-0 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                    <p className="text-3xl font-display font-bold mt-1">{s.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center`}>
                    <s.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {students.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid lg:grid-cols-2 gap-4 mb-8">
            <Card className="glass border-0 p-6">
              <h3 className="font-display font-semibold text-lg mb-4">Course Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={courseData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="course" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card className="glass border-0 p-6">
              <h3 className="font-display font-semibold text-lg mb-4">Course Breakdown</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={courseData} dataKey="count" nameKey="course" cx="50%" cy="50%" outerRadius={90} label>
                    {courseData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        )}

        <Card className="glass border-0 p-4 mb-6 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by name, course, email, roll no, college..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <select
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="all">All Courses</option>
            {courses.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gradient-bg border-0 shadow-glow gap-2">
                <Plus className="w-4 h-4" /> Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="glass border-0 max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">{editing ? "Edit Student" : "New Student"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSave} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
                  <div><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
                  <div><Label>Course *</Label><Input value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} placeholder="e.g. Computer Science" required /></div>
                  <div><Label>College</Label><Input value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} placeholder="e.g. MIT" /></div>
                  <div><Label>Roll No</Label><Input value={form.roll_no} onChange={(e) => setForm({ ...form, roll_no: e.target.value })} placeholder="e.g. CS21B042" /></div>
                  <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 555 123 4567" /></div>
                  <div><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="City, Country" /></div>
                  <div><Label>Age</Label><Input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} /></div>
                </div>
                <div><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} /></div>
                <Button type="submit" disabled={saving} className="w-full gradient-bg border-0 shadow-glow h-11">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editing ? "Save Changes" : "Add Student"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </Card>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <Card className="glass border-0 p-16 text-center">
            <GraduationCap className="w-16 h-16 mx-auto mb-4 text-muted-foreground/40" />
            <p className="text-muted-foreground">{students.length === 0 ? "No students yet — add your first one!" : "No matches found."}</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filtered.map((s, i) => (
                <motion.div
                  key={s.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card className="glass border-0 p-5 h-full flex flex-col hover:shadow-elegant transition-all hover:-translate-y-1">
                    <div className="flex items-start justify-between mb-3">
                      <Link to={`/students/${s.id}`} className="flex items-center gap-3 group flex-1 min-w-0">
                        <Avatar className="w-12 h-12 transition-transform group-hover:scale-105">
                          <AvatarFallback className="gradient-bg text-white">
                            {s.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <h4 className="font-semibold group-hover:text-primary transition-colors truncate">{s.name}</h4>
                          <p className="text-xs text-muted-foreground truncate">{s.email}</p>
                        </div>
                      </Link>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8" asChild><Link to={`/students/${s.id}`}><Eye className="w-4 h-4" /></Link></Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(s)}><Edit2 className="w-4 h-4" /></Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDelete(s.id)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge className="gradient-bg border-0">{s.course}</Badge>
                      {s.roll_no && <Badge variant="outline" className="gap-1"><Hash className="w-3 h-3" />{s.roll_no}</Badge>}
                      {s.age && <Badge variant="outline">Age {s.age}</Badge>}
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground mb-3">
                      {s.college && <div className="flex items-center gap-2"><Building2 className="w-3 h-3 shrink-0" /><span className="truncate">{s.college}</span></div>}
                      {s.phone && <div className="flex items-center gap-2"><Phone className="w-3 h-3 shrink-0" /><span className="truncate">{s.phone}</span></div>}
                      {s.location && <div className="flex items-center gap-2"><MapPin className="w-3 h-3 shrink-0" /><span className="truncate">{s.location}</span></div>}
                    </div>
                    <div className="mt-auto pt-3 border-t border-border/50">
                      <div className="flex items-center gap-1.5 text-xs font-medium mb-1.5">
                        <Sparkles className="w-3 h-3 text-primary" />
                        <span className="gradient-text">AI Recommendations</span>
                      </div>
                      <ul className="text-xs text-muted-foreground space-y-0.5">
                        {(RECOMMENDATIONS[s.course] || RECOMMENDATIONS.default).slice(0, 2).map((r) => <li key={r}>• {r}</li>)}
                      </ul>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Detail view dialog */}
      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="glass border-0 max-w-lg">
          {viewing && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">{viewing.name}</DialogTitle>
              </DialogHeader>
              <div className="flex items-center gap-4 py-2">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="gradient-bg text-white text-xl">
                    {viewing.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Badge className="gradient-bg border-0 mb-1">{viewing.course}</Badge>
                  <p className="text-sm text-muted-foreground">{viewing.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {viewing.roll_no && <Detail icon={Hash} label="Roll No" value={viewing.roll_no} />}
                {viewing.college && <Detail icon={Building2} label="College" value={viewing.college} />}
                {viewing.phone && <Detail icon={Phone} label="Phone" value={viewing.phone} />}
                {viewing.location && <Detail icon={MapPin} label="Location" value={viewing.location} />}
                {viewing.age && <Detail icon={Users} label="Age" value={String(viewing.age)} />}
              </div>
              {viewing.notes && (
                <div className="mt-2">
                  <p className="text-xs font-medium text-muted-foreground mb-1">NOTES</p>
                  <p className="text-sm">{viewing.notes}</p>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

const Detail = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <div className="glass rounded-lg p-3">
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
      <Icon className="w-3 h-3" /> {label}
    </div>
    <p className="font-medium truncate">{value}</p>
  </div>
);

export default Dashboard;
