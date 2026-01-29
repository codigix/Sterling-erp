import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { 
  useParams, 
  useNavigate 
} from "react-router-dom";
import { 
  ChevronLeft, 
  Printer, 
  Download, 
  Edit2, 
  FileText, 
  Layers, 
  PackageCheck, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Boxes,
  Hammer,
  Trash2,
  CheckCircle2
} from "lucide-react";
import axios from "../../../utils/api";
import Badge from "../../../components/ui/Badge";
import Card, { CardContent, CardHeader } from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import DataTable from "../../../components/ui/DataTable/DataTable";
import { useReactToPrint } from "react-to-print";

const BOMDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bom, setBom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const printRef = useRef();

  const fetchBOMDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/engineering/bom/comprehensive/${id}`);
      setBom(response.data);
    } catch (err) {
      console.error("Failed to fetch BOM details:", err);
      setError("Failed to load BOM details. It might have been deleted.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBOMDetails();
  }, [fetchBOMDetails]);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  const handleExportPDF = () => {
    if (!bom) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(18);
    doc.setTextColor(40);
    doc.text("Bill of Materials", pageWidth / 2, 15, { align: "center" });

    doc.setFontSize(10);
    doc.text(`BOM ID: ${bom.bomNumber || bom.itemCode}`, 14, 25);
    doc.text(`Product: ${bom.productName}`, 14, 30);
    doc.text(`Revision: ${bom.revision}`, 14, 35);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - 14, 25, { align: "right" });

    let currentY = 45;

    // Costs Summary
    doc.setFontSize(12);
    doc.text("Cost Summary", 14, currentY);
    currentY += 5;

    doc.autoTable({
      startY: currentY,
      head: [['Category', 'Cost']],
      body: [
        ['Material Cost', `INR ${bom.costs.materialCost.toLocaleString()}`],
        ['Component Cost', `INR ${bom.costs.componentCost.toLocaleString()}`],
        ['Operation Cost', `INR ${bom.costs.operationCost.toLocaleString()}`],
        ['Total BOM Cost', `INR ${bom.costs.totalBOMCost.toLocaleString()}`]
      ],
      theme: 'grid',
      headStyles: { fillGray: true }
    });

    currentY = doc.lastAutoTable.finalY + 10;

    // Materials Table
    if (bom.materials?.length > 0) {
      doc.setFontSize(12);
      doc.text("Materials Breakdown", 14, currentY);
      currentY += 5;
      
      doc.autoTable({
        startY: currentY,
        head: [['Item Name', 'Group', 'Qty', 'Unit', 'Rate', 'Total']],
        body: bom.materials.map(m => [
          m.itemName,
          m.itemGroup,
          m.quantity,
          m.uom,
          m.rate,
          (m.quantity * m.rate).toFixed(2)
        ]),
        theme: 'striped'
      });
      currentY = doc.lastAutoTable.finalY + 10;
    }

    // Components Table
    if (bom.components?.length > 0) {
      if (currentY > 250) { doc.addPage(); currentY = 15; }
      doc.setFontSize(12);
      doc.text("Components / Sub-Assemblies", 14, currentY);
      currentY += 5;
      
      doc.autoTable({
        startY: currentY,
        head: [['Component Code', 'Qty', 'Unit', 'Rate', 'Loss %', 'Total']],
        body: bom.components.map(c => [
          c.componentCode,
          c.quantity,
          c.uom,
          c.rate,
          `${c.lossPercent}%`,
          (c.quantity * c.rate).toFixed(2)
        ]),
        theme: 'striped'
      });
      currentY = doc.lastAutoTable.finalY + 10;
    }

    // Operations Table
    if (bom.operations?.length > 0) {
      if (currentY > 250) { doc.addPage(); currentY = 15; }
      doc.setFontSize(12);
      doc.text("Operations Breakdown", 14, currentY);
      currentY += 5;
      
      doc.autoTable({
        startY: currentY,
        head: [['Operation', 'Workstation', 'Cycle (min)', 'Setup (min)', 'Hourly Rate', 'Cost']],
        body: bom.operations.map(o => [
          o.operationName,
          o.workstation,
          o.cycleTime,
          o.setupTime,
          o.hourlyRate,
          o.cost
        ]),
        theme: 'striped'
      });
    }

    doc.save(`BOM_${bom.itemCode}_Rev${bom.revision}.pdf`);
  };

  const stats = useMemo(() => {
    if (!bom || !bom.costs) return [];
    return [
      { label: "Material Cost", value: `₹${bom.costs.materialCost.toLocaleString()}`, icon: Boxes, color: "blue" },
      { label: "Component Cost", value: `₹${bom.costs.componentCost.toLocaleString()}`, icon: Layers, color: "indigo" },
      { label: "Operation Cost", value: `₹${bom.costs.operationCost.toLocaleString()}`, icon: Hammer, color: "amber" },
      { label: "Total BOM Cost", value: `₹${bom.costs.totalBOMCost.toLocaleString()}`, icon: TrendingUp, color: "purple" },
    ];
  }, [bom]);

  const materialColumns = [
    { key: "itemName", label: "ITEM NAME", className: "font-medium" },
    { key: "itemGroup", label: "GROUP", render: (val) => <Badge variant="gray">{val}</Badge> },
    { key: "quantity", label: "QTY", render: (val, row) => `${val} ${row.uom}` },
    { key: "rate", label: "RATE", render: (val) => `₹${parseFloat(val).toLocaleString()}` },
    { key: "total", label: "TOTAL", render: (_, row) => `₹${(row.quantity * row.rate).toLocaleString()}` },
  ];

  const componentColumns = [
    { key: "componentCode", label: "COMPONENT CODE", className: "font-medium" },
    { key: "quantity", label: "QTY", render: (val, row) => `${val} ${row.uom}` },
    { key: "rate", label: "RATE", render: (val) => `₹${parseFloat(val).toLocaleString()}` },
    { key: "lossPercent", label: "LOSS %", render: (val) => `${val}%` },
    { key: "total", label: "TOTAL", render: (_, row) => `₹${(row.quantity * row.rate).toLocaleString()}` },
  ];

  const operationColumns = [
    { key: "operationName", label: "OPERATION", className: "font-medium" },
    { key: "workstation", label: "WORKSTATION" },
    { key: "cycleTime", label: "CYCLE (MIN)", render: (val) => `${val}m` },
    { key: "setupTime", label: "SETUP (MIN)", render: (val) => `${val}m` },
    { key: "hourlyRate", label: "HOURLY RATE", render: (val) => `₹${parseFloat(val).toLocaleString()}` },
    { key: "cost", label: "COST", render: (val) => `₹${parseFloat(val).toLocaleString()}` },
  ];

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !bom) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center gap-3">
          <AlertCircle size={20} />
          <p>{error || "BOM not found"}</p>
        </div>
        <Button 
          variant="secondary" 
          className="mt-4" 
          icon={ChevronLeft}
          onClick={() => navigate("/design-engineer/bom/view")}
        >
          Back to BOMs
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-slate-50/50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/design-engineer/bom/view")}
            className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-slate-200"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-slate-900">{bom.productName}</h2>
              <Badge 
                variant={bom.status === 'active' ? 'success' : bom.status === 'approved' ? 'primary' : 'warning'}
                className="capitalize px-3 py-1 text-xs"
              >
                {bom.status}
              </Badge>
            </div>
            <p className="text-slate-500 text-sm font-medium">
              BOM ID: <span className="text-slate-900">{bom.bomNumber || bom.itemCode}</span> • Revision: {bom.revision}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" icon={Printer} onClick={handlePrint}>Print</Button>
          <Button variant="secondary" icon={Download} onClick={handleExportPDF}>Export PDF</Button>
          <Button 
            variant="primary" 
            icon={Edit2}
            onClick={() => navigate(`/design-engineer/bom/create?bomId=${bom.id}`)}
          >
            Edit BOM
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <Card key={idx} className="border-none shadow-sm overflow-hidden relative">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-${stat.color}-50 text-${stat.color}-600`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">{stat.label}</p>
                <p className="text-xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </CardContent>
            <div className={`absolute top-0 left-0 w-1 h-full bg-${stat.color}-500`} />
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: BOM Info & Summary */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-white p-4">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                <FileText size={16} className="text-blue-600" />
                General Information
              </h3>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Item Group</p>
                  <p className="text-sm font-semibold text-slate-700">{bom.itemGroup || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Quantity</p>
                  <p className="text-sm font-semibold text-slate-700">{bom.quantity} {bom.uom}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Created By</p>
                  <p className="text-sm font-semibold text-slate-700">{bom.createdByName || 'System'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Date</p>
                  <p className="text-sm font-semibold text-slate-700">{new Date(bom.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Description</p>
                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
                  {bom.description || "No description provided."}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-white p-4">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                <CheckCircle2 size={16} className="text-green-600" />
                BOM Status
              </h3>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex items-center gap-4 mb-4">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  bom.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                }`}>
                  {bom.status === 'active' ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 capitalize">{bom.status} Status</p>
                  <p className="text-xs text-slate-500">
                    {bom.status === 'active' ? 'This BOM is currently active and can be used in production.' : 'This BOM is in draft mode and needs approval.'}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Is Default</span>
                  <Badge variant={bom.isDefault ? "success" : "gray"}>{bom.isDefault ? "Yes" : "No"}</Badge>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Is Active</span>
                  <Badge variant={bom.isActive ? "success" : "gray"}>{bom.isActive ? "Yes" : "No"}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Tables */}
        <div className="lg:col-span-2 space-y-6">
          {/* Materials Table */}
          <Card className="border-none shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-white p-4 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                <Boxes size={16} className="text-blue-600" />
                Raw Materials
              </h3>
              <Badge variant="primary">{bom.materials?.length || 0} Items</Badge>
            </CardHeader>
            <CardContent className="p-0">
              <DataTable 
                columns={materialColumns}
                data={bom.materials || []}
                emptyMessage="No raw materials added to this BOM."
              />
            </CardContent>
          </Card>

          {/* Components Table */}
          <Card className="border-none shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-white p-4 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                <Layers size={16} className="text-purple-600" />
                Sub Assemblies / Components
              </h3>
              <Badge variant="primary">{bom.components?.length || 0} Items</Badge>
            </CardHeader>
            <CardContent className="p-0">
              <DataTable 
                columns={componentColumns}
                data={bom.components || []}
                emptyMessage="No components added to this BOM."
              />
            </CardContent>
          </Card>

          {/* Operations Table */}
          <Card className="border-none shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-white p-4 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                <Hammer size={16} className="text-amber-600" />
                Manufacturing Operations
              </h3>
              <Badge variant="primary">{bom.operations?.length || 0} Operations</Badge>
            </CardHeader>
            <CardContent className="p-0">
              <DataTable 
                columns={operationColumns}
                data={bom.operations || []}
                emptyMessage="No operations added to this BOM."
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Hidden Print Content */}
      <div className="hidden">
        <div ref={printRef} className="p-10 text-slate-900">
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
            <div>
              <h1 className="text-3xl font-bold uppercase tracking-tighter">Bill of Materials</h1>
              <p className="text-sm font-bold mt-1">Sterling ERP Solutions</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold">BOM NO: {bom.bom_number || bom.item_code}</p>
              <p className="text-sm">REVISION: {bom.revision}</p>
              <p className="text-sm">DATE: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">Product Information</h4>
              <p className="text-lg font-bold">{bom.product_name}</p>
              <p className="text-sm">Group: {bom.item_group}</p>
              <p className="text-sm">Quantity: {bom.quantity} {bom.uom}</p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">Cost Summary</h4>
              <p className="text-sm">Material Cost: ₹{bom.costs?.materialCost.toLocaleString()}</p>
              <p className="text-sm">Operation Cost: ₹{bom.costs?.operationCost.toLocaleString()}</p>
              <p className="text-lg font-bold mt-2">Total Cost: ₹{bom.costs?.totalBOMCost.toLocaleString()}</p>
            </div>
          </div>

          <div className="space-y-8">
            <section>
              <h4 className="text-sm font-bold uppercase border-b border-slate-300 pb-1 mb-3">Raw Materials</h4>
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-2">Item</th>
                    <th className="py-2 text-right">Qty</th>
                    <th className="py-2 text-right">Rate</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {bom.materials?.map((m, i) => (
                    <tr key={i} className="border-b border-slate-100">
                      <td className="py-2">{m.item_name}</td>
                      <td className="py-2 text-right">{m.quantity} {m.uom}</td>
                      <td className="py-2 text-right">₹{parseFloat(m.rate).toLocaleString()}</td>
                      <td className="py-2 text-right">₹{(m.quantity * m.rate).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section>
              <h4 className="text-sm font-bold uppercase border-b border-slate-300 pb-1 mb-3">Sub Assemblies / Components</h4>
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-2">Component Code</th>
                    <th className="py-2 text-right">Qty</th>
                    <th className="py-2 text-right">Rate</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {bom.components?.map((c, i) => (
                    <tr key={i} className="border-b border-slate-100">
                      <td className="py-2">{c.component_code}</td>
                      <td className="py-2 text-right">{c.quantity} {c.uom}</td>
                      <td className="py-2 text-right">₹{parseFloat(c.rate).toLocaleString()}</td>
                      <td className="py-2 text-right">₹{(c.quantity * c.rate).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section>
              <h4 className="text-sm font-bold uppercase border-b border-slate-300 pb-1 mb-3">Operations</h4>
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-2">Operation</th>
                    <th className="py-2">Workstation</th>
                    <th className="py-2 text-right">Cycle Time</th>
                    <th className="py-2 text-right">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {bom.operations?.map((o, i) => (
                    <tr key={i} className="border-b border-slate-100">
                      <td className="py-2">{o.operation_name}</td>
                      <td className="py-2">{o.workstation}</td>
                      <td className="py-2 text-right">{o.cycle_time}m</td>
                      <td className="py-2 text-right">₹{parseFloat(o.cost).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>

          <div className="mt-20 flex justify-between">
            <div className="text-center w-48">
              <div className="border-b border-slate-900 mb-2"></div>
              <p className="text-xs font-bold">PREPARED BY</p>
            </div>
            <div className="text-center w-48">
              <div className="border-b border-slate-900 mb-2"></div>
              <p className="text-xs font-bold">APPROVED BY</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BOMDetailsPage;
