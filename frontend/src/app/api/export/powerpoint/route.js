import PptxGenJS from "pptxgenjs";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get the data from the request body
    const { data, reportTitle = "Pension Analysis Presentation" } = await request.json();

    if (!data || !Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ error: "No data provided for export" }, { status: 400 });
    }

    // Create PowerPoint presentation
    const pptx = new PptxGenJS();

    // Title slide
    const slide1 = pptx.addSlide();
    slide1.addText(reportTitle, { x: 1, y: 1, fontSize: 24, bold: true });
    slide1.addText("Generated Report", { x: 1, y: 2, fontSize: 16 });
    slide1.addText(`Generated on: ${new Date().toLocaleDateString()}`, { x: 1, y: 2.5, fontSize: 12 });

    // KPIs slide
    if (data.length > 0) {
      const slide2 = pptx.addSlide();
      slide2.addText("Key Performance Indicators", { x: 1, y: 0.5, fontSize: 20, bold: true });
      
      // Calculate some basic KPIs
      const totalMembers = data.length;
      const avgAge = data.reduce((sum, item) => sum + (item.Age || item.age || 0), 0) / totalMembers;
      const avgIncome = data.reduce((sum, item) => sum + (item.Annual_Income || item.annual_income || 0), 0) / totalMembers;
      const avgSavings = data.reduce((sum, item) => sum + (item.Current_Savings || item.current_savings || 0), 0) / totalMembers;

      slide2.addText(`Total Members: ${totalMembers}`, { x: 1, y: 1.5, fontSize: 14 });
      slide2.addText(`Average Age: ${Math.round(avgAge)} years`, { x: 1, y: 2, fontSize: 14 });
      slide2.addText(`Average Annual Income: $${Math.round(avgIncome).toLocaleString()}`, { x: 1, y: 2.5, fontSize: 14 });
      slide2.addText(`Average Current Savings: $${Math.round(avgSavings).toLocaleString()}`, { x: 1, y: 3, fontSize: 14 });
    }

    // Data summary slide
    const slide3 = pptx.addSlide();
    slide3.addText("Data Summary", { x: 1, y: 0.5, fontSize: 20, bold: true });
    
    // Create a simple table with sample data
    const tableData = [
      ["Member ID", "Age", "Annual Income", "Current Savings", "Country"],
    ];
    
    // Add first 10 records to the table
    data.slice(0, 10).forEach(item => {
      tableData.push([
        String(item.User_ID || item.user_id || item.id || "N/A"),
        String(item.Age || item.age || "N/A"),
        `$${(item.Annual_Income || item.annual_income || 0).toLocaleString()}`,
        `$${(item.Current_Savings || item.current_savings || 0).toLocaleString()}`,
        String(item.Country || item.country || "N/A")
      ]);
    });

    slide3.addTable(tableData, { x: 0.5, y: 1.2, w: 8.5, h: 4, fontSize: 10 });

    // Generate the PowerPoint file as base64
    const pptxBuffer = await pptx.write("base64");

    // Return the file as a download
    return new NextResponse(Buffer.from(pptxBuffer, "base64"), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": "attachment; filename=Pension_Report.pptx",
      },
    });

  } catch (error) {
    console.error("PowerPoint export error:", error);
    return NextResponse.json({ 
      error: "Failed to generate PowerPoint presentation",
      details: error.message 
    }, { status: 500 });
  }
}
