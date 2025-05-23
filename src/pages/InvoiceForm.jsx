import React, { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardTitle, CardContent } from '@/components/ui/card';
import { Printer, Download, Eye, FileText } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const PDFComponents = React.lazy(() =>
    import('@react-pdf/renderer').then(module => ({
        default: {
            Document: module.Document, Page: module.Page, Text: module.Text, View: module.View,
            StyleSheet: module.StyleSheet, PDFViewer: module.PDFViewer, PDFDownloadLink: module.PDFDownloadLink, pdf: module.pdf
        }
    }))
);

const pdfStyles = {
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 30,
        fontSize: 10,
        fontFamily: 'Helvetica'
    },
    header: {
        marginBottom: 20,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#000000',
        borderBottomStyle: 'solid'
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10
    },
    headerInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    headerLeft: {
        flexDirection: 'column'
    },
    headerRight: {
        flexDirection: 'column',
        alignItems: 'flex-end'
    },
    billTo: {
        marginBottom: 20
    },
    billToTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 5
    },
    table: {
        display: 'table',
        width: 'auto',
        borderStyle: 'solid',
        borderWidth: 1,
        borderRightWidth: 0,
        borderBottomWidth: 0,
        marginBottom: 20
    },
    tableRow: {
        margin: 'auto',
        flexDirection: 'row'
    },
    tableColHeader: {
        width: '25%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        backgroundColor: '#f0f0f0',
        padding: 8
    },
    tableCol: {
        width: '25%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        padding: 8
    },
    tableCellHeader: {
        margin: 'auto',
        fontSize: 10,
        fontWeight: 'bold'
    },
    tableCell: {
        margin: 'auto',
        fontSize: 9
    },
    totals: {
        marginTop: 20,
        alignItems: 'flex-end'
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: 200,
        marginBottom: 5
    },
    grandTotal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: 200,
        marginTop: 10,
        paddingTop: 5,
        borderTopWidth: 1,
        borderTopColor: '#000000',
        borderTopStyle: 'solid',
        fontWeight: 'bold'
    },
    notes: {
        marginTop: 30,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#000000',
        borderTopStyle: 'solid',
        fontStyle: 'italic'
    }
};

const InvoicePDF = React.memo(({ invoice, subtotal, tax, total }) => {
    const [PDFLoaded, setPDFLoaded] = useState(false);
    const [pdfComponents, setPdfComponents] = useState(null);

    React.useEffect(() => {
        const loadPDFComponents = async () => {
            try {
                const module = await import('@react-pdf/renderer'), styles = module.StyleSheet.create(pdfStyles);
                setPdfComponents({
                    Document: module.Document, Page: module.Page, Text: module.Text, View: module.View, styles
                });
                setPDFLoaded(true);
            } catch (error) {
                console.error('Failed to load PDF components:', error);
            }
        };

        if (!PDFLoaded) { loadPDFComponents(); }
    }, [PDFLoaded]);

    if (!PDFLoaded || !pdfComponents) { return null; }

    const { Document, Page, Text, View, styles } = pdfComponents;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>INVOICE</Text>
                    <View style={styles.headerInfo}>
                        <View style={styles.headerLeft}>
                            <Text style={{ fontWeight: 'bold' }}>Invoice #: {invoice.invoiceNumber}</Text>
                            <Text>Date: {invoice.date}</Text>
                            <Text>Due Date: {invoice.dueDate}</Text>
                        </View>
                        <View style={styles.headerRight}>
                            <Text style={{ fontWeight: 'bold' }}>From: {invoice.from.name}</Text>
                            <Text>{invoice.from.address}</Text>
                            <Text>{invoice.from.email}</Text>
                            <Text>{invoice.from.phone}</Text>
                        </View>
                    </View>
                </View>

                {/* Bill To */}
                <View style={styles.billTo}>
                    <Text style={styles.billToTitle}>Bill To:</Text>
                    <Text>{invoice.to.name}</Text>
                    <Text>{invoice.to.address}</Text>
                    <Text>{invoice.to.email}</Text>
                    <Text>{invoice.to.phone}</Text>
                </View>

                {/* Items Table */}
                <View style={styles.table}>
                    {/* Table Header */}
                    <View style={styles.tableRow}>
                        <View style={styles.tableColHeader}>
                            <Text style={styles.tableCellHeader}>Description</Text>
                        </View>
                        <View style={styles.tableColHeader}>
                            <Text style={styles.tableCellHeader}>Quantity</Text>
                        </View>
                        <View style={styles.tableColHeader}>
                            <Text style={styles.tableCellHeader}>Price</Text>
                        </View>
                        <View style={styles.tableColHeader}>
                            <Text style={styles.tableCellHeader}>Amount</Text>
                        </View>
                    </View>

                    {/* Table Rows */}
                    {invoice.items.map((item, index) => (
                        <View style={styles.tableRow} key={index}>
                            <View style={styles.tableCol}>
                                <Text style={styles.tableCell}>{item.description}</Text>
                            </View>
                            <View style={styles.tableCol}>
                                <Text style={styles.tableCell}>{item.quantity}</Text>
                            </View>
                            <View style={styles.tableCol}>
                                <Text style={styles.tableCell}>${item.price.toFixed(2)}</Text>
                            </View>
                            <View style={styles.tableCol}>
                                <Text style={styles.tableCell}>${(item.quantity * item.price).toFixed(2)}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Totals */}
                <View style={styles.totals}>
                    <View style={styles.totalRow}>
                        <Text>Subtotal:</Text>
                        <Text>${subtotal.toFixed(2)}</Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text>Tax ({(invoice.taxRate * 100).toFixed(1)}%):</Text>
                        <Text>${tax.toFixed(2)}</Text>
                    </View>
                    <View style={styles.grandTotal}>
                        <Text>Total:</Text>
                        <Text>${total.toFixed(2)}</Text>
                    </View>
                </View>

                {/* Notes */}
                {invoice.notes && (
                    <View style={styles.notes}>
                        <Text>Notes: {invoice.notes}</Text>
                    </View>
                )}
            </Page>
        </Document>
    );
});

InvoicePDF.displayName = 'InvoicePDF';

const InvoiceForm = () => {
    const [invoice, setInvoice] = useState({
        invoiceNumber: 'INV-001',
        date: new Date().toLocaleDateString(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        from: {
            name: 'Your Company Name', address: '123 Company St, City', email: 'contact@company.com', phone: '(123) 456-7890'
        },
        to: {
            name: 'Client Name', address: '456 Client Ave, Town', email: 'client@email.com', phone: '(987) 654-3210'
        },
        items: [
            { id: 1, description: 'Product 1', quantity: 2, price: 100 },
            { id: 2, description: 'Product 2', quantity: 1, price: 200 },
            { id: 3, description: 'Service 1', quantity: 3, price: 50 }
        ],
        taxRate: 0.1,
        notes: 'Thank you for your business!'
    });

    const [showPreview, setShowPreview] = useState(false);
    const [showPDFViewer, setShowPDFViewer] = useState(false);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

    const { subtotal, tax, total } = useMemo(() => {
        const subtotal = invoice.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        const tax = subtotal * invoice.taxRate;
        const total = subtotal + tax;
        return { subtotal, tax, total };
    }, [invoice.items, invoice.taxRate]);

    const pdfDocument = useMemo(() => {
        return <InvoicePDF invoice={invoice} subtotal={subtotal} tax={tax} total={total} />;
    }, [invoice, subtotal, tax, total]);

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setInvoice(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleItemChange = useCallback((id, field, value) => {
        setInvoice(prev => ({
            ...prev,
            items: prev.items.map(item =>
                item.id === id ? { ...item, [field]: field === 'description' ? value : Number(value) } : item
            )
        }));
    }, []);

    const addNewItem = useCallback(() => {
        setInvoice(prev => ({
            ...prev,
            items: [...prev.items, {
                id: Date.now(), description: '', quantity: 1, price: 0
            }]
        }));
    }, []);

    const removeItem = useCallback((id) => {
        setInvoice(prev => ({
            ...prev,
            items: prev.items.filter(item => item.id !== id)
        }));
    }, []);

    // PDF Download Link Component
    const PDFDownloadButton = React.memo(() => {
        const [PDFDownloadLink, setPDFDownloadLink] = useState(null);

        React.useEffect(() => {
            const loadPDFDownloadLink = async () => {
                try {
                    const { PDFDownloadLink: PDFDLLink } = await import('@react-pdf/renderer');
                    setPDFDownloadLink(() => PDFDLLink);
                } catch (error) {
                    console.error('Failed to load PDFDownloadLink:', error);
                }
            };
            loadPDFDownloadLink();
        }, []);

        if (!PDFDownloadLink) {
            return (
                <Button className="gap-2" disabled>
                    <FileText className="h-4 w-4" />
                    Loading PDF...
                </Button>
            );
        }

        return (
            <PDFDownloadLink document={pdfDocument} fileName={`Invoice_${invoice.invoiceNumber}.pdf`} >
                {({ blob, url, loading, error }) => (
                    <Button className="gap-2" disabled={loading}>
                        <FileText className="h-4 w-4" />
                        {loading ? 'Generating PDF...' : 'Download PDF'}
                    </Button>
                )}
            </PDFDownloadLink>
        );
    });

    PDFDownloadButton.displayName = 'PDFDownloadButton';

    // PDF Viewer Component
    const PDFViewerComponent = React.memo(() => {
        const [PDFViewer, setPDFViewer] = useState(null);

        React.useEffect(() => {
            const loadPDFViewer = async () => {
                try {
                    const { PDFViewer: PDFV } = await import('@react-pdf/renderer');
                    setPDFViewer(() => PDFV);
                } catch (error) {
                    console.error('Failed to load PDFViewer:', error);
                }
            };
            if (showPDFViewer) {
                loadPDFViewer();
            }
        }, [showPDFViewer]);

        if (!showPDFViewer || !PDFViewer) {
            return null;
        }

        return (
            <Card className="p-6 mb-6">
                <CardTitle className="mb-4">PDF Viewer</CardTitle>
                <div style={{ height: '600px', width: '100%' }}>
                    <React.Suspense fallback={<div>Loading PDF Viewer...</div>}>
                        <PDFViewer style={{ width: '100%', height: '100%' }}>
                            {pdfDocument}
                        </PDFViewer>
                    </React.Suspense>
                </div>
            </Card>
        );
    });

    PDFViewerComponent.displayName = 'PDFViewerComponent';

    return (
        <div className="flex flex-col gap-6 p-4">
            <h1 className="text-2xl font-semibold">Invoice Generator</h1>

            <div className="flex flex-wrap gap-4">

                <PDFDownloadButton />

                {/* <Button variant="outline" className="gap-2" onClick={() => setShowPreview(!showPreview)}>
                      <Eye className="h-4 w-4" /> {showPreview ? 'Hide Preview' : 'Show Preview'}
                    </Button> */}

                <Button variant="outline" className="gap-2" onClick={() => setShowPDFViewer(!showPDFViewer)}>
                    <FileText className="h-4 w-4" /> {showPDFViewer ? 'Hide Print Invoice' : 'Print Invoice'}
                </Button>
            </div>

            {/* PDF Viewer */}
            <PDFViewerComponent />

            {/* HTML Preview */}
            {showPreview && (
                <Card className="p-6 mb-6">
                    <CardTitle className="mb-4">HTML Preview</CardTitle>
                    <div className="p-8 border rounded bg-white">
                        <div className="mb-8 pb-4 border-b">
                            <h1 className="text-3xl font-bold mb-2">INVOICE</h1>
                            <div className="flex justify-between">
                                <div>
                                    <p className="font-semibold">Invoice #: {invoice.invoiceNumber}</p>
                                    <p>Date: {invoice.date}</p>
                                    <p>Due Date: {invoice.dueDate}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold">From: {invoice.from.name}</p>
                                    <p>{invoice.from.address}</p>
                                    <p>{invoice.from.email}</p>
                                    <p>{invoice.from.phone}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-8">
                            <div className="flex justify-between">
                                <div>
                                    <h2 className="font-semibold mb-2">Bill To:</h2>
                                    <p>{invoice.to.name}</p>
                                    <p>{invoice.to.address}</p>
                                    <p>{invoice.to.email}</p>
                                    <p>{invoice.to.phone}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-8">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-2">Description</th>
                                        <th className="text-right py-2">Quantity</th>
                                        <th className="text-right py-2">Price</th>
                                        <th className="text-right py-2">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoice.items.map((item) => (
                                        <tr key={item.id} className="border-b">
                                            <td className="py-2">{item.description}</td>
                                            <td className="text-right py-2">{item.quantity}</td>
                                            <td className="text-right py-2">${item.price.toFixed(2)}</td>
                                            <td className="text-right py-2">${(item.quantity * item.price).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="ml-auto w-1/2">
                            <div className="flex justify-between py-1">
                                <span>Subtotal:</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span>Tax ({(invoice.taxRate * 100).toFixed(1)}%):</span>
                                <span>${tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between py-2 font-bold text-lg border-t mt-2">
                                <span>Total:</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                        </div>

                        {invoice.notes && (
                            <div className="mt-8 pt-4 border-t italic">
                                <p>Notes: {invoice.notes}</p>
                            </div>
                        )}
                    </div>
                </Card>
            )}

            {/* Form Controls */}
            <Card className="p-6">
                <CardTitle className="mb-4">Invoice Details</CardTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-4">
                        <div>
                            <Label className="block text-sm font-medium mb-1">Invoice Number</Label>
                            <Input type="text" name="invoiceNumber" value={invoice.invoiceNumber}
                                onChange={handleInputChange} className="w-full p-2 border rounded"
                            />
                        </div>
                        <div>
                            <Label className="block text-sm font-medium mb-1">Date</Label>
                            <Input type="text" name="date" value={invoice.date}
                                onChange={handleInputChange} className="w-full p-2 border rounded"
                            />
                        </div>
                        <div>
                            <Label className="block text-sm font-medium mb-1">Due Date</Label>
                            <Input type="text" name="dueDate" value={invoice.dueDate}
                                onChange={handleInputChange} className="w-full p-2 border rounded"
                            />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <Label className="block text-sm font-medium mb-1">Tax Rate (%)</Label>
                            <Input type="number" name="taxRate" value={invoice.taxRate * 100}
                                onChange={(e) => setInvoice(prev => ({ ...prev, taxRate: parseFloat(e.target.value) / 100 }))}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div>
                            <Label className="block text-sm font-medium mb-1">Notes</Label>
                            <Textarea name="notes" value={invoice.notes}
                                onChange={handleInputChange} className="w-full p-2 border rounded" rows={3}
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <Card className="p-4">
                        <h3 className="text-lg font-medium mb-3">From</h3>
                        <div className="space-y-3">
                            <Input type="text" value={invoice.from.name}
                                onChange={(e) => setInvoice(prev => ({ ...prev, from: { ...prev.from, name: e.target.value } }))}
                                className="w-full p-2 border rounded" placeholder="Name"
                            />
                            <Input type="text" value={invoice.from.address}
                                onChange={(e) => setInvoice(prev => ({ ...prev, from: { ...prev.from, address: e.target.value } }))}
                                className="w-full p-2 border rounded" placeholder="Address"
                            />
                            <Input type="text" value={invoice.from.email}
                                onChange={(e) => setInvoice(prev => ({ ...prev, from: { ...prev.from, email: e.target.value } }))}
                                className="w-full p-2 border rounded" placeholder="Email"
                            />
                            <Input type="text" value={invoice.from.phone}
                                onChange={(e) => setInvoice(prev => ({ ...prev, from: { ...prev.from, phone: e.target.value } }))}
                                className="w-full p-2 border rounded" placeholder="Phone"
                            />
                        </div>
                    </Card>

                    <Card className="p-4">
                        <h3 className="text-lg font-medium mb-3">To</h3>
                        <div className="space-y-3">
                            <Input type="text" value={invoice.to.name}
                                onChange={(e) => setInvoice(prev => ({ ...prev, to: { ...prev.to, name: e.target.value } }))}
                                className="w-full p-2 border rounded" placeholder="Name"
                            />
                            <Input type="text" value={invoice.to.address}
                                onChange={(e) => setInvoice(prev => ({ ...prev, to: { ...prev.to, address: e.target.value } }))}
                                className="w-full p-2 border rounded" placeholder="Address"
                            />
                            <Input type="text" value={invoice.to.email}
                                onChange={(e) => setInvoice(prev => ({ ...prev, to: { ...prev.to, email: e.target.value } }))}
                                className="w-full p-2 border rounded" placeholder="Email"
                            />
                            <Input type="text" value={invoice.to.phone}
                                onChange={(e) => setInvoice(prev => ({ ...prev, to: { ...prev.to, phone: e.target.value } }))}
                                className="w-full p-2 border rounded" placeholder="Phone"
                            />
                        </div>
                    </Card>
                </div>

                <Card className="p-4 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium mb-3">Items</h3>
                        <Button onClick={addNewItem} size="sm">
                            Add Item
                        </Button>
                    </div>
                    <div className="space-y-4">
                        {invoice.items.map((item) => (
                            <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                                <div className="col-span-5">
                                    <Input type="text" value={item.description}
                                        onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                                        className="w-full p-2 border rounded" placeholder="Description"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <Input type="number" value={item.quantity}
                                        onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                                        className="w-full p-2 border rounded" placeholder="Qty" min="1"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <Input type="number" value={item.price}
                                        onChange={(e) => handleItemChange(item.id, 'price', e.target.value)}
                                        className="w-full p-2 border rounded" placeholder="Price" min="0" step="0.01"
                                    />
                                </div>
                                <div className="col-span-2 text-right text-lg">
                                    ${(item.quantity * item.price).toFixed(2)}
                                </div>
                                <div className="col-span-1">
                                    <Button variant="ghost" size="sm"
                                        onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700"
                                    >
                                        Remove
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <div className="flex justify-end">
                    <div className="w-full md:w-1/2 space-y-2 text-lg">
                        <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Tax ({(invoice.taxRate * 100).toFixed(1)}%):</span>
                            <span>${tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                            <span>Total:</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default InvoiceForm;