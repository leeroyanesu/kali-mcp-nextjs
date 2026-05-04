export async function exportToDOCX(content: string, title: string, isHtml = false) {
  if (typeof window === "undefined") return;

  try {
    const response = await fetch('/api/docx', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content, title, isHtml }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate DOCX');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^\w\s]/gi, '').replace(/\s+/g, "_")}.docx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error("Failed to generate DOCX", error);
    throw error;
  }
}
