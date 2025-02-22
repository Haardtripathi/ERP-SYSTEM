import React, { useEffect } from 'react';
import JsBarcode from 'jsbarcode';
import jsPDF from 'jspdf';

const formatShipmentData = (data) => {
    return {
        awb_number: data.awb_number || 'N/A',
        payment_type: data.payment_type?.value || 'N/A',
        amount: data.amount?.value || 'N/A',
        shipment_type: data.shipment_type?.value || 'N/A',
        hub_id: data.shipment_type?.hub_id || 'N/A',
        date: data.date || 'N/A',
        ref: data.ref || 'N/A',
        first_name: data.cm_first_name || 'N/A',
        last_name: data.cm_last_name || 'N/A',
        cm_phone: data.cm_phone || 'N/A',
        address: data.address || 'N/A',
        city: data.city || 'N/A',
        sub_district: data.district || 'N/A',
        post_type: data.post_type?.value || 'N/A',
        post: data.post || 'N/A',
        state: data.state?.value || 'N/A',
        pincode: data.pincode || 'N/A',
        quantity: data.products?.value?.reduce((sum, product) => sum + parseInt(product.quantity || 0), 0).toString() || 'N/A',
        product_id: data.products?.value?.map(p => p.product).join(', ') || 'N/A'
    };
};

const generateShippingLabelPDF = (shipmentData) => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a5'
    });

    // Create barcodes synchronously
    const createBarcode = (text) => {
        const canvas = document.createElement('canvas');
        JsBarcode(canvas, text, { format: 'CODE128' });
        return canvas.toDataURL('image/png');
    };

    const awbDataURL = createBarcode(shipmentData.awb_number);
    const refDataURL = createBarcode(shipmentData.ref);

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

    return doc;
};

const FormatPDF = ({ selectedData }) => {
    useEffect(() => {
        const generatePDFs = () => {
            if (!selectedData || selectedData.length === 0) return;

            const formattedData = selectedData.map(formatShipmentData);

            formattedData.forEach((shipmentData, index) => {
                const doc = generateShippingLabelPDF(shipmentData);
                doc.save(`shipping_label_${index + 1}.pdf`);
            });
        };

        generatePDFs();
    }, [selectedData]);

    return null;
};

export default FormatPDF;