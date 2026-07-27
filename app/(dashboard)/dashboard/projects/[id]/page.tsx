import connectDB from "@/lib/mongodb";
import Project from "@/models/Project";
import ContentForm, { type Field } from "@/components/dashboard/ContentForm";
import DeleteButton from "@/components/dashboard/DeleteButton";
import { notFound } from "next/navigation";

const FIELDS = [
  { name: "title", label: "Project Title", required: true },
  { name: "slug", label: "Slug" },
  {
    name: "category",
    label: "Category",
    type: "select",
    required: true,
    options: ["wordpress", "woocommerce", "webflow", "mern", "framer", "other"],
  },
  { name: "year", label: "Year", type: "number", required: true },
  { name: "client", label: "Client Name" },
  { name: "duration", label: "Duration" },
  { name: "liveUrl", label: "Live URL" },
  { name: "githubUrl", label: "GitHub URL" },
  { name: "excerpt", label: "Short Excerpt", type: "textarea" },
  { name: "content", label: "Full Case Study (Markdown)", type: "textarea" },
  { name: "tags", label: "Tags", type: "tags" },
  { name: "stack", label: "Tech Stack", type: "tags" },
  { name: "featured", label: "Featured?", type: "checkbox" },
  { name: "published", label: "Published?", type: "checkbox" },
] satisfies Field[];

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await connectDB();
  const project = await Project.findById(id).lean();
  if (!project) notFound();

  const p = project as any;
  const defaults = { ...p, tags: p.tags || [], stack: p.stack || [] };

  return (
    <div style={{ padding: 32 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            fontFamily: "var(--f-d)",
            color: "#f0ede6",
            letterSpacing: "-.02em",
          }}
        >
          Edit Project
        </h1>
        <DeleteButton
          endpoint={`/api/projects/${id}`}
          redirectTo="/dashboard/projects"
        />
      </div>
      <ContentForm
        title="Project Details"
        endpoint={`/api/projects/${id}`}
        method="PUT"
        fields={FIELDS}
        defaults={defaults}
        redirectTo="/dashboard/projects"
      />
    </div>
  );
}
