// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize with current date
    document.getElementById('quoteDate').valueAsDate = new Date();
    
    // Set expiration date to 30 days from now by default
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30);
    document.getElementById('expirationDate').valueAsDate = expirationDate;
    
    // Generate a random quote number
    document.getElementById('quoteNumber').value = generateQuoteNumber();
    
    // Add event listeners
    document.getElementById('addItemBtn').addEventListener('click', addItemRow);
    document.getElementById('quotationForm').addEventListener('submit', generateQuotation);
    document.getElementById('resetBtn').addEventListener('click', resetForm);
    
    // Add print option event listeners
    document.getElementById('savePdfBtn').addEventListener('click', savePDF);
    document.getElementById('printNowBtn').addEventListener('click', printNow);
    
    // Add checkboxes to existing rows and set up event listeners
    document.querySelectorAll('.item-row').forEach(setupExistingRow);
    
    // Initial calculation
    calculateTotals();
    updatePreview();
    
    // Set up event delegation for dynamically added item rows
    document.getElementById('itemsContainer').addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-item')) {
            removeItemRow(e.target);
        }
    });
    
    // Add event listener for recalculating on input change
    document.getElementById('itemsContainer').addEventListener('input', function(e) {
        if (e.target.classList.contains('item-price') || e.target.classList.contains('item-area')) {
            calculateRowTotal(e.target.closest('.item-row'));
            calculateTotals();
            updatePreview();
        }
    });
    
    // Add event listener for "To be measured" checkboxes
    document.getElementById('itemsContainer').addEventListener('change', function(e) {
        if (e.target.classList.contains('to-be-measured')) {
            const row = e.target.closest('.item-row');
            const areaInput = row.querySelector('.item-area');
            
            if (e.target.checked) {
                areaInput.disabled = true;
                areaInput.required = false;
                areaInput.value = '';
            } else {
                areaInput.disabled = false;
                areaInput.required = true;
            }
            
            calculateRowTotal(row);
            calculateTotals();
            updatePreview();
        }
        
        // Handle "To be calculated" checkbox for totals
        if (e.target.classList.contains('to-be-calculated')) {
            updatePreview();
        }
    });
    
    document.getElementById('discount').addEventListener('input', function() {
        calculateTotals();
        updatePreview();
    });
    
    document.getElementById('tax').addEventListener('input', function() {
        calculateTotals();
        updatePreview();
    });
    
    // Event listeners for form fields to update preview
    const formFields = ['quoteNumber', 'quoteDate', 'clientName', 'clientAddress', 'expirationDate'];
    formFields.forEach(field => {
        document.getElementById(field).addEventListener('input', updatePreview);
    });
});

// Generate a random quote number
function generateQuoteNumber() {
    const prefix = 'QT';
    const timestamp = new Date().getTime().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp}-${random}`;
}

// Setup existing rows with the checkboxes
function setupExistingRow(row) {
    // This is only needed for upgrading old versions of the form
    // With the new structure, we should only need to handle this for legacy items
    
    // Check if this is an old-style row that needs upgrading
    const oldStyleArea = row.querySelector(':scope > .item-area');
    const oldStylePrice = row.querySelector(':scope > .item-price');
    const oldStyleDesc = row.querySelector(':scope > .item-description');
    const oldStyleTotal = row.querySelector(':scope > .item-total');
    
    if (oldStyleArea || oldStylePrice || oldStyleDesc || oldStyleTotal) {
        // This is an old structure that needs to be updated
        
        // Get values from old elements
        const description = oldStyleDesc ? oldStyleDesc.value : '';
        const price = oldStylePrice ? oldStylePrice.value : '';
        const area = oldStyleArea ? oldStyleArea.value : '';
        const total = oldStyleTotal ? oldStyleTotal.textContent : '0.00';
        
        // Create new structure
        const newRow = document.createElement('div');
        newRow.className = 'item-row';
        newRow.innerHTML = `
            <div class="item-details">
                <input type="text" placeholder="Description" class="item-description" required value="${description}">
                
                <div class="item-subrow">
                    <div class="price-input-group">
                        <label>Price per square foot (LKR):</label>
                        <input type="number" placeholder="Price" class="item-price" min="0" required value="${price}">
                    </div>
                </div>
                
                <div class="item-subrow">
                    <div class="area-input-group">
                        <label>Area (sq.ft):</label>
                        <div class="area-control">
                            <input type="number" placeholder="Area" class="item-area" min="0" value="${area}">
                            <label class="checkbox-label"><input type="checkbox" class="to-be-measured"> To be measured</label>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="item-actions">
                <div class="total-input-group">
                    <span class="item-total">${total}</span>
                    <label class="checkbox-label"><input type="checkbox" class="to-be-calculated"> To be calculated</label>
                </div>
                <button type="button" class="remove-item">✕</button>
            </div>
        `;
        
        // Replace old row with new structure
        row.parentNode.replaceChild(newRow, row);
    }
}

// Add a new item row
function addItemRow() {
    const itemsContainer = document.getElementById('itemsContainer');
    const newRow = document.createElement('div');
    newRow.className = 'item-row';
    newRow.innerHTML = `
        <div class="item-details">
            <input type="text" placeholder="Description" class="item-description" required>
            
            <div class="item-subrow">
                <div class="price-input-group">
                    <label>Price per square foot (LKR):</label>
                    <input type="number" placeholder="Price" class="item-price" min="0" required>
                </div>
            </div>
            
            <div class="item-subrow">
                <div class="area-input-group">
                    <label>Area (sq.ft):</label>
                    <div class="area-control">
                        <input type="number" placeholder="Area" class="item-area" min="0">
                        <label class="checkbox-label"><input type="checkbox" class="to-be-measured"> To be measured</label>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="item-actions">
            <div class="total-input-group">
                <span class="item-total">0.00</span>
                <label class="checkbox-label"><input type="checkbox" class="to-be-calculated"> To be calculated</label>
            </div>
            <button type="button" class="remove-item">✕</button>
        </div>
    `;
    itemsContainer.appendChild(newRow);
    
    // Set focus on the new item's description field
    newRow.querySelector('.item-description').focus();
}

// Remove an item row
function removeItemRow(button) {
    const row = button.closest('.item-row');
    
    // Make sure we always have at least one row
    if (document.querySelectorAll('.item-row').length > 1) {
        row.remove();
        calculateTotals();
        updatePreview();
    } else {
        // Clear the inputs if it's the last row
        const inputs = row.querySelectorAll('input');
        inputs.forEach(input => input.value = '');
        row.querySelector('.item-total').textContent = '0.00';
        calculateTotals();
        updatePreview();
    }
}

// Calculate total for a single row
function calculateRowTotal(row) {
    const priceInput = row.querySelector('.item-price');
    const areaInput = row.querySelector('.item-area');
    const totalSpan = row.querySelector('.item-total');
    const toBeMeasured = row.querySelector('.to-be-measured');
    const toBeCalculated = row.querySelector('.to-be-calculated');
    
    if (priceInput && areaInput && totalSpan && toBeMeasured) {
        // Check if "To be calculated" is checked
        if (toBeCalculated && toBeCalculated.checked) {
            totalSpan.textContent = 'TBC';
            return;
        }
        
        // Normal calculation if we have price and area values and "To be measured" is not checked
        if (priceInput.value && (!toBeMeasured.checked && areaInput.value)) {
            const price = parseFloat(priceInput.value);
            const area = parseFloat(areaInput.value);
            const total = price * area;
            totalSpan.textContent = total.toFixed(2);
        } else if (priceInput.value && toBeMeasured.checked) {
            totalSpan.textContent = 'TBC';
        } else {
            totalSpan.textContent = '0.00';
        }
    }
}

// Calculate all totals
function calculateTotals() {
    let subtotal = 0;
    
    // Calculate each row total and add to subtotal
    document.querySelectorAll('.item-row').forEach(row => {
        const totalSpan = row.querySelector('.item-total');
        const toBeCalculated = row.querySelector('.to-be-calculated');
        
        if (totalSpan && totalSpan.textContent !== 'TBC' && !toBeCalculated.checked) {
            subtotal += parseFloat(totalSpan.textContent || 0);
        }
    });
    
    // Display the subtotal
    const subtotalDisplay = document.getElementById('subtotal');
    if (subtotalDisplay) {
        subtotalDisplay.value = subtotal.toFixed(2);
    }
    
    // Get discount value
    const discountInput = document.getElementById('discount');
    const discount = discountInput && discountInput.value ? parseFloat(discountInput.value) : 0;
    
    // Get tax/VAT value
    const taxInput = document.getElementById('tax');
    const tax = taxInput && taxInput.value ? parseFloat(taxInput.value) : 0;
    
    // Calculate final total
    const total = subtotal - discount + tax;
    
    // Display the total
    const totalDisplay = document.getElementById('total');
    if (totalDisplay) {
        totalDisplay.value = total.toFixed(2);
    }
}

// Update the quotation preview
function updatePreview() {
    // Update basic quote details
    document.getElementById('preview-quoteNumber').textContent = document.getElementById('quoteNumber').value;
    
    // Format dates for display
    const quoteDate = document.getElementById('quoteDate').value;
    if (quoteDate) {
        document.getElementById('preview-quoteDate').textContent = formatDate(quoteDate);
    }
    
    const expirationDate = document.getElementById('expirationDate').value;
    if (expirationDate) {
        document.getElementById('preview-expirationDate').textContent = formatDate(expirationDate);
    }
    
    // Update client information
    document.getElementById('preview-clientName').textContent = document.getElementById('clientName').value;
    document.getElementById('preview-clientAddress').textContent = document.getElementById('clientAddress').value;
    
    // Update items in the table
    const previewItems = document.getElementById('preview-items');
    previewItems.innerHTML = '';
    
    let anyToBeCalculated = false;
    let anyToBeMeasured = false;
    
    document.querySelectorAll('.item-row').forEach(row => {
        const description = row.querySelector('.item-description').value;
        if (!description) return; // Skip empty rows
        
        const price = row.querySelector('.item-price').value;
        const areaInput = row.querySelector('.item-area');
        const toBeMeasured = row.querySelector('.to-be-measured').checked;
        const toBeCalculated = row.querySelector('.to-be-calculated').checked;
        
        const area = toBeMeasured ? 'To be measured' : (areaInput.value || '0');
        
        let total;
        if (toBeCalculated) {
            total = 'To be calculated';
            anyToBeCalculated = true;
        } else if (toBeMeasured) {
            total = 'To be calculated';
            anyToBeMeasured = true;
        } else {
            total = row.querySelector('.item-total').textContent;
        }
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${description}</td>
            <td>${price}</td>
            <td>${area}</td>
            <td>${total}</td>
        `;
        previewItems.appendChild(tr);
    });
    
    // Update subtotal, discount, tax, and total
    document.getElementById('preview-subtotal').textContent = document.getElementById('subtotal').value;
    
    // Update discount display
    const discountValue = document.getElementById('discount').value;
    document.getElementById('preview-discount').textContent = discountValue > 0 ? discountValue : '0.00';
    
    // Update tax/VAT
    document.getElementById('preview-tax').textContent = document.getElementById('tax').value;
    
    // Update final total
    const totalValue = document.getElementById('total').value;
    document.getElementById('preview-total').textContent = 
        anyToBeCalculated || anyToBeMeasured ? 'To be finalized' : totalValue;
}

// Format date to a readable format
function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Add device detection function
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Modify savePDF function
function savePDF() {
    // Validate the form first
    if (!validateForm()) {
        return;
    }
    
    // Final update of preview
    updatePreview();
    
    // Show loading indicator
    showLoading('Generating PDF...');
    
    // Pre-load the logo and seal to ensure they're rendered in the PDF
    const logoImg = new Image();
    logoImg.src = 'Logo.jpg';
    
    const sealImg = new Image();
    sealImg.src = 'assets/hmsenadheera_seal_small.png';
    
    // Function to generate PDF once images are loaded
    const generatePDF = function() {
        // Generate PDF using html2canvas and jsPDF
        const { jsPDF } = window.jspdf;
        const quotationElement = document.getElementById('quotationToPrint');
        
        // Apply professional styling specifically for PDF generation
        const originalStyle = quotationElement.getAttribute('style') || '';
        quotationElement.setAttribute('style', 'background-color: white; max-width: 800px; margin: 0 auto;');
        
        // Ensure the QUOTE text and info box are displayed properly
        const quoteInfo = quotationElement.querySelector('.quote-info');
        if (quoteInfo) {
            quoteInfo.style.backgroundColor = '#2c3e50';
            quoteInfo.style.color = 'white';
            quoteInfo.style.padding = '15px 20px';
            quoteInfo.style.borderRadius = '8px';
            quoteInfo.style.display = 'inline-block';
            quoteInfo.style.margin = '15px 0';
        }

        // Make sure the QUOTE heading is visible with proper styling
        const quoteHeading = quotationElement.querySelector('.quote-info h2');
        if (quoteHeading) {
            quoteHeading.style.color = 'white';
            quoteHeading.style.margin = '0 0 5px 0';
            quoteHeading.style.fontSize = '18px';
            quoteHeading.style.fontWeight = 'bold';
        }
        
        // Adjust table styling for PDF
        const thElements = quotationElement.querySelectorAll('th');
        thElements.forEach(th => {
            th.style.backgroundColor = '#4baed5';
            th.style.color = 'white';
        });
        
        const oddRows = quotationElement.querySelectorAll('tbody tr:nth-child(odd)');
        oddRows.forEach(row => {
            row.style.backgroundColor = '#e8f4f9';
        });
        
        const evenRows = quotationElement.querySelectorAll('tbody tr:nth-child(even)');
        evenRows.forEach(row => {
            row.style.backgroundColor = '#f7fbfd';
        });
        
        // Style the document note
        const documentNote = quotationElement.querySelector('.document-note');
        if (documentNote) {
            documentNote.style.fontStyle = 'italic';
            documentNote.style.color = '#666';
            documentNote.style.fontSize = '11px';
            documentNote.style.textAlign = 'center';
            documentNote.style.marginTop = '30px';
            documentNote.style.paddingTop = '10px';
            documentNote.style.borderTop = '1px dotted #ccc';
        }
        
        // Style the company seal
        const companySeal = quotationElement.querySelector('.company-seal img');
        if (companySeal) {
            companySeal.style.width = '120px';
            companySeal.style.opacity = '0.9';
            companySeal.style.transform = 'rotate(-5deg)';
        }
        
        // Define PDF options
        const pdfOptions = {
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            putOnlyUsedFonts: true,
            compress: true,
            precision: 3
        };
        
        html2canvas(quotationElement, {
            scale: 3, // Higher scale for better quality
            logging: false,
            useCORS: true,
            allowTaint: true,
            imageTimeout: 15000, // Extended timeout for image loading
            backgroundColor: '#ffffff',
            onclone: function(clonedDoc) {
                // Make sure logo is visible in the cloned document
                const logoImg = clonedDoc.querySelector('.company-logo img');
                if (logoImg) {
                    logoImg.style.visibility = 'visible';
                }
                
                // Ensure the QUOTE text and info box are displayed properly
                const quoteInfo = clonedDoc.querySelector('.quote-info');
                if (quoteInfo) {
                    quoteInfo.style.backgroundColor = '#2c3e50';
                    quoteInfo.style.color = 'white';
                    quoteInfo.style.padding = '15px 20px';
                    quoteInfo.style.borderRadius = '8px';
                    quoteInfo.style.display = 'inline-block';
                    quoteInfo.style.margin = '15px 0';
                }

                // Make sure the QUOTE heading is visible with proper styling
                const quoteHeading = clonedDoc.querySelector('.quote-info h2');
                if (quoteHeading) {
                    quoteHeading.style.color = 'white';
                    quoteHeading.style.margin = '0 0 5px 0';
                    quoteHeading.style.fontSize = '18px';
                    quoteHeading.style.fontWeight = 'bold';
                }
                
                // Ensure all styled elements in the cloned document are rendered properly
                const elements = clonedDoc.querySelectorAll('.quote-table, .client-info, .important-points');
                elements.forEach(el => {
                    if (el.style) {
                        el.style.boxShadow = 'none'; // Remove shadows for PDF
                    }
                });
                
                // Style the document note in cloned doc
                const documentNote = clonedDoc.querySelector('.document-note');
                if (documentNote) {
                    documentNote.style.fontStyle = 'italic';
                    documentNote.style.color = '#666';
                    documentNote.style.fontSize = '11px';
                    documentNote.style.textAlign = 'center';
                    documentNote.style.marginTop = '30px';
                    documentNote.style.paddingTop = '10px';
                    documentNote.style.borderTop = '1px dotted #ccc';
                }
                
                // Make sure the company seal is visible in the cloned document
                const sealImg = clonedDoc.querySelector('.company-seal img');
                if (sealImg) {
                    sealImg.style.visibility = 'visible';
                    sealImg.style.width = '120px';
                    sealImg.style.opacity = '0.9';
                    sealImg.style.transform = 'rotate(-5deg)';
                }
                
                // Style table headers
                const thElements = clonedDoc.querySelectorAll('th');
                thElements.forEach(th => {
                    th.style.backgroundColor = '#4baed5';
                    th.style.color = 'white';
                });
                
                // Style table rows
                const oddRows = clonedDoc.querySelectorAll('tbody tr:nth-child(odd)');
                oddRows.forEach(row => {
                    row.style.backgroundColor = '#e8f4f9';
                });
                
                const evenRows = clonedDoc.querySelectorAll('tbody tr:nth-child(even)');
                evenRows.forEach(row => {
                    row.style.backgroundColor = '#f7fbfd';
                });
            }
        }).then(canvas => {
            // Restore original styling
            quotationElement.setAttribute('style', originalStyle);
            
            // Reset table styling
            thElements.forEach(th => {
                th.style.backgroundColor = '';
                th.style.color = '';
            });
            
            oddRows.forEach(row => {
                row.style.backgroundColor = '';
            });
            
            evenRows.forEach(row => {
                row.style.backgroundColor = '';
            });
            
            // Reset document note styling
            if (documentNote) {
                documentNote.style.fontStyle = '';
                documentNote.style.color = '';
                documentNote.style.fontSize = '';
                documentNote.style.textAlign = '';
                documentNote.style.marginTop = '';
                documentNote.style.paddingTop = '';
                documentNote.style.borderTop = '';
            }
            
            // Reset company seal styling
            if (companySeal) {
                companySeal.style.width = '';
                companySeal.style.opacity = '';
                companySeal.style.transform = '';
            }
            
            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            const pdf = new jsPDF(pdfOptions);
            
            // Calculate dimensions to fit A4 page properly
            const imgWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm
            
            // Calculate scale ratio to fit the content on a single page
            let imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            // Scale down if the height exceeds A4 page height
            if (imgHeight > pageHeight) {
                const scaleFactor = pageHeight / imgHeight;
                imgHeight = pageHeight;
                // Adjust width proportionally
                const scaledWidth = imgWidth * scaleFactor;
                // Center the image horizontally
                const xOffset = (imgWidth - scaledWidth) / 2;
                pdf.addImage(imgData, 'JPEG', xOffset, 0, scaledWidth, imgHeight);
            } else {
                // Center the image vertically if it's shorter than the page
                const yOffset = (pageHeight - imgHeight) / 2;
                pdf.addImage(imgData, 'JPEG', 0, yOffset, imgWidth, imgHeight);
            }
            
            // Add metadata to PDF
            pdf.setProperties({
                title: `Quotation - ${document.getElementById('quoteNumber').value}`,
                subject: 'Waterproofing Services Quotation',
                author: 'H.M. SENADHEERA WATERPROOFINGS',
                keywords: 'quotation, waterproofing, services',
                creator: 'Quotation Generator'
            });
            
            // Get client name for filename
            const clientName = document.getElementById('clientName').value.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const quoteNumber = document.getElementById('quoteNumber').value.replace(/[^a-z0-9]/gi, '_');
            const filename = `quotation_${quoteNumber}_${clientName}.pdf`;
            
            // Get PDF as data URL
            const pdfData = pdf.output('datauristring');
            
            // For mobile devices
            if (isMobileDevice()) {
                const pdfWindow = window.open("");
                pdfWindow.document.write(
                    `<iframe width='100%' height='100%' src='${pdfData}'></iframe>`
                );
            }
            // For desktop browsers
            else {
                pdf.save(filename);
            }

            hideLoading();
        }).catch(error => {
            console.error('Error generating PDF:', error);
            hideLoading();
            alert('There was an error generating the PDF. Please try again.');
        });
    };
    
    // Check if both images are loaded
    let logoLoaded = false;
    let sealLoaded = false;
    
    logoImg.onload = function() {
        logoLoaded = true;
        if (sealLoaded) generatePDF();
    };
    
    sealImg.onload = function() {
        sealLoaded = true;
        if (logoLoaded) generatePDF();
    };
    
    logoImg.onerror = function() {
        console.error('Error loading logo image');
        logoLoaded = true;
        if (sealLoaded) generatePDF();
    };
    
    sealImg.onerror = function() {
        console.error('Error loading seal image');
        sealLoaded = true;
        if (logoLoaded) generatePDF();
    };
}

// Print now function
function printNow() {
    // Validate the form first
    if (!validateForm()) {
        return;
    }
    
    // Final update of preview
    updatePreview();
    
    // Show loading indicator
    showLoading('Preparing for printing...');
    
    // Pre-load the logo to ensure it's rendered
    const logoImg = new Image();
    logoImg.src = 'Logo.jpg';
    
    logoImg.onload = function() {
        // Use html2canvas to render the quotation
        const quotationElement = document.getElementById('quotationToPrint');
        
        // Apply professional styling specifically for printing
        const originalStyle = quotationElement.getAttribute('style') || '';
        quotationElement.setAttribute('style', 'background-color: white; max-width: 800px; margin: 0 auto;');
        
        html2canvas(quotationElement, {
            scale: 3,
            logging: false,
            useCORS: true,
            allowTaint: true,
            imageTimeout: 15000,
            backgroundColor: '#ffffff',
            onclone: function(clonedDoc) {
                // Make sure logo is visible in the cloned document
                const logoImg = clonedDoc.querySelector('.company-logo img');
                if (logoImg) {
                    logoImg.style.visibility = 'visible';
                }
                
                // Ensure all styled elements in the cloned document are rendered properly
                const elements = clonedDoc.querySelectorAll('.quote-table, .client-info, .quote-info, .important-points');
                elements.forEach(el => {
                    if (el.style) {
                        el.style.boxShadow = 'none'; // Remove shadows for printing
                    }
                });
            }
        }).then(canvas => {
            // Restore original styling
            quotationElement.setAttribute('style', originalStyle);
            
            // Hide loading indicator
            hideLoading();
            
            // Create a new window for printing
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                alert('Please allow pop-ups to use the print function.');
                return;
            }
            
            // Add the image to the new window with improved styling
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Print Quotation</title>
                        <style>
                            @page {
                                size: A4;
                                margin: 0;
                            }
                            html, body {
                                margin: 0;
                                padding: 0;
                                display: flex;
                                justify-content: center;
                                height: 100%;
                                width: 100%;
                                background-color: white;
                            }
                            img {
                                max-width: 100%;
                                height: auto;
                                display: block;
                            }
                            @media print {
                                body {
                                    margin: 0;
                                    padding: 0;
                                }
                                img {
                                    width: 100%;
                                    height: auto;
                                    page-break-inside: avoid;
                                }
                            }
                        </style>
                    </head>
                    <body>
                        <img src="${canvas.toDataURL('image/jpeg', 1.0)}" />
                        <script>
                            window.onload = function() {
                                setTimeout(function() {
                                    window.print();
                                    window.close();
                                }, 1000); // Longer timeout to ensure proper loading
                            };
                        </script>
                    </body>
                </html>
            `);
            printWindow.document.close();
        }).catch(error => {
            console.error('Error preparing for print:', error);
            hideLoading();
            alert('There was an error preparing the document for printing. Please try again.');
        });
    };
    
    logoImg.onerror = function() {
        console.error('Error loading logo image');
        // Continue with printing even if logo fails to load
        printWithoutLogo();
    };
}

// Fallback function if logo can't be loaded for printing
function printWithoutLogo() {
    // Use html2canvas to render the quotation
    const quotationElement = document.getElementById('quotationToPrint');
    
    html2canvas(quotationElement, {
        scale: 2,
        logging: false,
        useCORS: true
    }).then(canvas => {
        // Hide loading indicator
        hideLoading();
        
        // Create a new window for printing
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Please allow pop-ups to use the print function.');
            return;
        }
        
        // Add the image to the new window
        printWindow.document.write(`
            <html>
                <head>
                    <title>Print Quotation</title>
                    <style>
                        @page {
                            size: A4;
                            margin: 0;
                        }
                        body {
                            margin: 0;
                            padding: 0;
                            display: flex;
                            justify-content: center;
                        }
                        img {
                            max-width: 100%;
                            height: auto;
                        }
                        @media print {
                            body {
                                margin: 0;
                                padding: 0;
                            }
                            img {
                                width: 100%;
                                height: auto;
                            }
                        }
                    </style>
                </head>
                <body>
                    <img src="${canvas.toDataURL('image/jpeg', 1.0)}" />
                    <script>
                        window.onload = function() {
                            setTimeout(function() {
                                window.print();
                                window.close();
                            }, 500);
                        };
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    }).catch(error => {
        console.error('Error preparing for print:', error);
        hideLoading();
        alert('There was an error preparing the document for printing. Please try again.');
    });
}

// Validate form
function validateForm() {
    // Make sure we have at least one item with values
    let hasValidItems = false;
    document.querySelectorAll('.item-row').forEach(row => {
        const description = row.querySelector('.item-description')?.value || '';
        const price = row.querySelector('.item-price')?.value || '';
        const toBeMeasured = row.querySelector('.to-be-measured')?.checked || false;
        const area = row.querySelector('.item-area')?.value || '';
        
        if (description && price && (toBeMeasured || area)) {
            hasValidItems = true;
        }
    });
    
    if (!hasValidItems) {
        alert('Please add at least one service item with description, price, and either area or "To be measured" checked.');
        return false;
    }
    
    // Check for client name (required)
    const clientName = document.getElementById('clientName').value;
    if (!clientName) {
        alert('Please enter a client name.');
        document.getElementById('clientName').focus();
        return false;
    }
    
    // Client address is optional - no validation needed
    
    return true;
}

// Show loading indicator
function showLoading(message) {
    // Create loading overlay if it doesn't exist
    if (!document.getElementById('loadingOverlay')) {
        const overlay = document.createElement('div');
        overlay.id = 'loadingOverlay';
        overlay.innerHTML = `
            <div class="loading-spinner"></div>
            <div class="loading-message">${message || 'Loading...'}</div>
        `;
        document.body.appendChild(overlay);
    } else {
        document.querySelector('#loadingOverlay .loading-message').textContent = message || 'Loading...';
        document.getElementById('loadingOverlay').style.display = 'flex';
    }
}

// Hide loading indicator
function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// Generate PDF quotation - modified to reuse savePDF function
function generateQuotation(e) {
    e.preventDefault();
    savePDF();
}

// Reset the form
function resetForm() {
    // Reset form fields that should be reset
    document.getElementById('clientName').value = '';
    document.getElementById('clientAddress').value = '';
    document.getElementById('discount').value = '0';
    document.getElementById('tax').value = '0';
    
    // Clear all item rows except the first one
    const itemRows = document.querySelectorAll('.item-row');
    for (let i = 1; i < itemRows.length; i++) {
        itemRows[i].remove();
    }
    
    // Clear first row
    const firstRow = document.querySelector('.item-row');
    if (firstRow) {
        firstRow.querySelectorAll('input').forEach(input => {
            if (input.type === 'checkbox') {
                input.checked = false;
            } else {
                input.value = '';
            }
        });
        
        // Re-enable area field
        const areaInput = firstRow.querySelector('.item-area');
        if (areaInput) {
            areaInput.disabled = false;
        }
        
        firstRow.querySelector('.item-total').textContent = '0.00';
    } else {
        // If there's no row, add a fresh one
        addItemRow();
    }
    
    // Generate new quote number
    document.getElementById('quoteNumber').value = generateQuoteNumber();
    
    // Reset dates to defaults
    document.getElementById('quoteDate').valueAsDate = new Date();
    
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30);
    document.getElementById('expirationDate').valueAsDate = expirationDate;
    
    // Recalculate totals
    calculateTotals();
    
    // Update preview
    updatePreview();
}

// Record the time when the splash loader is shown
const splashStartTime = Date.now();

// Once all resources are loaded, ensure the loader remains visible for at least 5 seconds
window.addEventListener('load', function() {
    const minDuration = 5000;
    const elapsed = Date.now() - splashStartTime;
    const remaining = Math.max(minDuration - elapsed, 0);
    setTimeout(function() {
        const splash = document.getElementById('splashLoader');
        if (splash) {
            splash.style.display = 'none';
        }
    }, remaining);
});