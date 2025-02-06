import React, { useRef } from 'react';
import JsBarcode from 'jsbarcode';
import jsPDF from 'jspdf';

const ShippingLabelGenerator = ({ shipmentData }) => {
    const awbBarcodeRef = useRef(null);
    const refBarcodeRef = useRef(null);

    const generatePDF = () => {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a5'
        });

        // Barcode generation
        const awbCanvas = document.createElement('canvas');
        JsBarcode(awbCanvas, shipmentData.awb_number, { format: 'CODE128' });
        const awbDataURL = awbCanvas.toDataURL('image/png');

        const refCanvas = document.createElement('canvas');
        JsBarcode(refCanvas, shipmentData.ref, { format: 'CODE128' });
        const refDataURL = refCanvas.toDataURL('image/png');

        // Add content to PDF
        doc.setFontSize(10);
        doc.addImage(awbDataURL, 'PNG', 10, 10, 100, 20);

        doc.text(`Payment Type: ${shipmentData.payment_type}`, 10, 40);
        doc.text(`Amount: Rs. ${shipmentData.amount}`, 10, 45);

        doc.text(`Shipment Type: ${shipmentData.shipment_type}`, 10, 55);
        doc.text(`Hub ID: ${shipmentData.hub_id}`, 10, 60);
        doc.text(`Date: ${shipmentData.date}`, 10, 65);

        doc.addImage(refDataURL, 'PNG', 10, 75, 100, 20);

        doc.text(`Name: ${shipmentData.first_name} ${shipmentData.last_name}`, 10, 105);
        doc.text(`Phone: ${shipmentData.cm_phone}`, 10, 110);
        doc.text(`Address: ${shipmentData.address}`, 10, 115);
        doc.text(`City: ${shipmentData.city}`, 10, 120);
        doc.text(`Sub District: ${shipmentData.sub_district}`, 10, 125);

        doc.text(`Post Type: ${shipmentData.post_type}`, 10, 135);
        doc.text(`Post: ${shipmentData.post}`, 10, 140);
        doc.text(`State: ${shipmentData.state}`, 10, 145);
        doc.text(`India - ${shipmentData.pincode}`, 10, 150);

        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(`Quantity: ${shipmentData.quantity}`, 10, 160);
        doc.text(`Product ID: ${shipmentData.product_id}`, 10, 165);

        doc.save('shipping_label.pdf');
    };

    return (
        <div className="shipping-label-generator">
            <button onClick={generatePDF} className="bg-blue-500 text-white p-2 rounded">
                Generate Shipping Label
            </button>
            {/* Hidden canvas elements for barcode generation */}
            <canvas ref={awbBarcodeRef} style={{ display: 'none' }} />
            <canvas ref={refBarcodeRef} style={{ display: 'none' }} />
        </div>
    );
};

export default ShippingLabelGenerator;

// // Example usage
// const shipmentData = {
//     awb_number: '6788c23ee8f2db2380972124',
//     payment_type: 'COD',
//     amount: '999.00',
//     shipment_type: 'Call Cut By Cus',
//     hub_id: '545s8',
//     date: '12:16:46 PM',
//     ref: '6788c23ee8f2db2380972124',
//     first_name: 'Jennifer',
//     last_name: 'Henderson',
//     cm_phone: '8196225942',
//     address: 'The Address - 22nd Floor, Block-B, Westgate by TrueValue, 96 Highway',
//     city: 'Ahmedabad',
//     sub_district: 'Gujarat',
//     post_type: 'Online',
//     post: 'Google',
//     state: 'Gujarat',
//     pincode: '380015',
//     quantity: '1',
//     product_id: 'MetaBurn Tab'
// };