import { MerchandisePaymentHistoryDto, SchoolFeesPaymentHistoryDto } from '@/models/PaymentsServicesInterfaces';
// @ts-ignore - expo-print package needs to be installed
import * as Print from 'expo-print';
// @ts-ignore - expo-sharing package needs to be installed
import * as Sharing from 'expo-sharing';
// @ts-ignore - expo-file-system package needs to be installed
import * as FileSystem from 'expo-file-system';
import { Alert, Platform } from 'react-native';

// Format currency helper
const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'CFA',
        minimumFractionDigits: 0,
    }).format(amount);
};

// Format date helper
const formatDate = (dateString: string): string => {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    } catch {
        return dateString;
    }
};

// Format time helper
const formatTime = (dateString: string): string => {
    try {
        const date = new Date(dateString);
        return date.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    } catch {
        return '';
    }
};

// Generate HTML for School Fee Payment Receipt
const generateSchoolFeeHTML = (payment: SchoolFeesPaymentHistoryDto): string => {
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reçu de Paiement - Frais Scolaires</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            padding: 20px;
            background-color: #ffffff;
            color: #333;
        }
        
        .receipt {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border: 2px solid #007AFF;
            border-radius: 10px;
        }
        
        .header {
            text-align: center;
            border-bottom: 3px solid #007AFF;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        
        .header h1 {
            color: #007AFF;
            font-size: 28px;
            margin-bottom: 10px;
        }
        
        .header h2 {
            color: #666;
            font-size: 18px;
            font-weight: normal;
        }
        
        .status-badge {
            display: inline-block;
            padding: 10px 20px;
            background-color: ${payment.fK_StatusId === 8 ? '#34C759' : '#FF9500'};
            color: white;
            border-radius: 25px;
            font-weight: bold;
            margin: 20px 0;
        }
        
        .section {
            margin-bottom: 25px;
        }
        
        .section-title {
            color: #007AFF;
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 15px;
            text-transform: uppercase;
            border-bottom: 2px solid #E5E5EA;
            padding-bottom: 5px;
        }
        
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #F2F2F7;
        }
        
        .info-label {
            color: #666;
            font-size: 14px;
        }
        
        .info-value {
            font-weight: 600;
            color: #000;
            font-size: 14px;
            text-align: right;
        }
        
        .amount-section {
            background-color: #F2F2F7;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
        }
        
        .amount-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
        }
        
        .amount-total {
            border-top: 2px solid #007AFF;
            margin-top: 10px;
            padding-top: 15px;
        }
        
        .amount-total .info-label {
            font-size: 18px;
            font-weight: bold;
            color: #000;
        }
        
        .amount-total .info-value {
            font-size: 22px;
            font-weight: bold;
            color: #007AFF;
        }
        
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #E5E5EA;
            text-align: center;
            color: #666;
            font-size: 12px;
        }
        
        .footer-note {
            margin-top: 10px;
            font-style: italic;
        }
        
        @media print {
            body {
                padding: 0;
            }
            
            .receipt {
                border: none;
            }
        }
    </style>
</head>
<body>
    <div class="receipt">
        <div class="header">
            <h1>REÇU DE PAIEMENT</h1>
            <h2>Frais Scolaires</h2>
            <div class="status-badge">
                ${payment.fK_StatusId === 8 ? '✓ Paiement Réussi' : 'En Attente'}
            </div>
        </div>
        
        <div class="section">
            <div class="section-title">Informations de l'élève</div>
            <div class="info-row">
                <span class="info-label">Nom complet</span>
                <span class="info-value">${payment.childFullName}</span>
            </div>
            ${payment.dateOfBirth ? `
            <div class="info-row">
                <span class="info-label">Date de naissance</span>
                <span class="info-value">${formatDate(payment.dateOfBirth)}</span>
            </div>
            ` : ''}
            ${payment.fatherName ? `
            <div class="info-row">
                <span class="info-label">Nom du père</span>
                <span class="info-value">${payment.fatherName}</span>
            </div>
            ` : ''}
        </div>
        
        <div class="section">
            <div class="section-title">Informations scolaires</div>
            <div class="info-row">
                <span class="info-label">École</span>
                <span class="info-value">${payment.schoolName}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Classe</span>
                <span class="info-value">${payment.schoolGradeName}</span>
            </div>
        </div>
        
        <div class="amount-section">
            <div class="amount-row">
                <span class="info-label">Montant du versement</span>
                <span class="info-value">${formatCurrency(payment.installmentAmount)}</span>
            </div>
            ${payment.lateFee && payment.lateFee > 0 ? `
            <div class="amount-row">
                <span class="info-label">Frais de retard</span>
                <span class="info-value" style="color: #FF3B30;">+ ${formatCurrency(payment.lateFee)}</span>
            </div>
            ` : ''}
            <div class="amount-row amount-total">
                <span class="info-label">Total Payé</span>
                <span class="info-value">${formatCurrency(payment.totalPaid)}</span>
            </div>
        </div>
        
        <div class="section">
            <div class="section-title">Détails de la transaction</div>
            <div class="info-row">
                <span class="info-label">Méthode de paiement</span>
                <span class="info-value">${payment.paymentMethod}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Référence</span>
                <span class="info-value">${payment.transactionReference || 'N/A'}</span>
            </div>
            ${payment.transactionMapId ? `
            <div class="info-row">
                <span class="info-label">ID de transaction</span>
                <span class="info-value" style="font-size: 11px;">${payment.transactionMapId}</span>
            </div>
            ` : ''}
            <div class="info-row">
                <span class="info-label">Date de paiement</span>
                <span class="info-value">${formatDate(payment.paidDate)}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Heure de paiement</span>
                <span class="info-value">${formatTime(payment.paidDate)}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Date d'échéance</span>
                <span class="info-value">${formatDate(payment.dueDate)}</span>
            </div>
        </div>
        
        ${payment.processedByAgent && payment.agentFullName ? `
        <div class="section">
            <div class="section-title">Agent Collecteur</div>
            <div class="info-row">
                <span class="info-label">Nom</span>
                <span class="info-value">${payment.agentFullName}</span>
            </div>
            ${payment.agentPhoneNumber ? `
            <div class="info-row">
                <span class="info-label">Téléphone</span>
                <span class="info-value">${payment.agentPhoneNumber}</span>
            </div>
            ` : ''}
        </div>
        ` : ''}
        
        <div class="footer">
            <p><strong>Reçu généré le ${formatDate(new Date().toISOString())}</strong></p>
            <p class="footer-note">
                Ce document certifie le paiement des frais scolaires mentionnés ci-dessus.
                Veuillez conserver ce reçu pour vos dossiers.
            </p>
        </div>
    </div>
</body>
</html>
    `;
};

// Generate HTML for Merchandise Payment Receipt
const generateMerchandiseHTML = (payment: MerchandisePaymentHistoryDto): string => {
    const itemsHTML = payment.merchandiseItems?.map(item => `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #E5E5EA;">${item.schoolMerchandiseName}</td>
            <td style="padding: 10px; border-bottom: 1px solid #E5E5EA; text-align: center;">${formatCurrency(item.schoolMerchandisePrice)}</td>
            <td style="padding: 10px; border-bottom: 1px solid #E5E5EA; text-align: center;">× ${item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #E5E5EA; text-align: right; font-weight: 600;">${formatCurrency(item.totalAmount)}</td>
        </tr>
    `).join('') || '';

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reçu de Paiement - Articles Scolaires</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            padding: 20px;
            background-color: #ffffff;
            color: #333;
        }
        
        .receipt {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border: 2px solid #FF9500;
            border-radius: 10px;
        }
        
        .header {
            text-align: center;
            border-bottom: 3px solid #FF9500;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        
        .header h1 {
            color: #FF9500;
            font-size: 28px;
            margin-bottom: 10px;
        }
        
        .header h2 {
            color: #666;
            font-size: 18px;
            font-weight: normal;
        }
        
        .status-badge {
            display: inline-block;
            padding: 10px 20px;
            background-color: ${payment.fK_StatusId === 8 ? '#34C759' : '#FF9500'};
            color: white;
            border-radius: 25px;
            font-weight: bold;
            margin: 20px 0;
        }
        
        .summary-box {
            background-color: #FFF9F0;
            border: 2px solid #FF9500;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 30px;
            text-align: center;
        }
        
        .summary-box h3 {
            color: #FF9500;
            font-size: 18px;
            margin-bottom: 10px;
        }
        
        .summary-box p {
            font-size: 16px;
            color: #666;
        }
        
        .section {
            margin-bottom: 25px;
        }
        
        .section-title {
            color: #FF9500;
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 15px;
            text-transform: uppercase;
            border-bottom: 2px solid #E5E5EA;
            padding-bottom: 5px;
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        
        .items-table thead {
            background-color: #F2F2F7;
        }
        
        .items-table th {
            padding: 12px;
            text-align: left;
            font-weight: bold;
            color: #333;
            border-bottom: 2px solid #FF9500;
        }
        
        .items-table th:nth-child(2),
        .items-table th:nth-child(3) {
            text-align: center;
        }
        
        .items-table th:nth-child(4) {
            text-align: right;
        }
        
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #F2F2F7;
        }
        
        .info-label {
            color: #666;
            font-size: 14px;
        }
        
        .info-value {
            font-weight: 600;
            color: #000;
            font-size: 14px;
            text-align: right;
        }
        
        .total-section {
            background-color: #F2F2F7;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
        }
        
        .total-row {
            display: flex;
            justify-content: space-between;
            padding: 15px 0;
            border-top: 2px solid #FF9500;
        }
        
        .total-row .info-label {
            font-size: 18px;
            font-weight: bold;
            color: #000;
        }
        
        .total-row .info-value {
            font-size: 22px;
            font-weight: bold;
            color: #FF9500;
        }
        
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #E5E5EA;
            text-align: center;
            color: #666;
            font-size: 12px;
        }
        
        .footer-note {
            margin-top: 10px;
            font-style: italic;
        }
        
        @media print {
            body {
                padding: 0;
            }
            
            .receipt {
                border: none;
            }
        }
    </style>
</head>
<body>
    <div class="receipt">
        <div class="header">
            <h1>REÇU DE PAIEMENT</h1>
            <h2>Articles Scolaires</h2>
            <div class="status-badge">
                ${payment.fK_StatusId === 8 ? '✓ Paiement Réussi' : 'En Attente'}
            </div>
        </div>
        
        <div class="summary-box">
            <h3>Résumé de l'achat</h3>
            <p><strong>${payment.totalItems}</strong> article${payment.totalItems > 1 ? 's' : ''} • Quantité totale: <strong>${payment.totalQuantity}</strong></p>
        </div>
        
        <div class="section">
            <div class="section-title">Articles Commandés</div>
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Article</th>
                        <th>Prix unitaire</th>
                        <th>Quantité</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHTML}
                </tbody>
            </table>
        </div>
        
        <div class="total-section">
            <div class="total-row">
                <span class="info-label">Total Payé</span>
                <span class="info-value">${formatCurrency(payment.amountPaid)}</span>
            </div>
        </div>
        
        <div class="section">
            <div class="section-title">Détails de la transaction</div>
            <div class="info-row">
                <span class="info-label">Méthode de paiement</span>
                <span class="info-value">${payment.paymentMethod}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Référence</span>
                <span class="info-value">${payment.transactionReference || 'N/A'}</span>
            </div>
            ${payment.transactionMapId ? `
            <div class="info-row">
                <span class="info-label">ID de transaction</span>
                <span class="info-value" style="font-size: 11px;">${payment.transactionMapId}</span>
            </div>
            ` : ''}
            <div class="info-row">
                <span class="info-label">Date de paiement</span>
                <span class="info-value">${formatDate(payment.paidDate)}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Heure de paiement</span>
                <span class="info-value">${formatTime(payment.paidDate)}</span>
            </div>
        </div>
        
        ${payment.processedByAgent && payment.agentFullName ? `
        <div class="section">
            <div class="section-title">Agent Collecteur</div>
            <div class="info-row">
                <span class="info-label">Nom</span>
                <span class="info-value">${payment.agentFullName}</span>
            </div>
            ${payment.agentPhoneNumber ? `
            <div class="info-row">
                <span class="info-label">Téléphone</span>
                <span class="info-value">${payment.agentPhoneNumber}</span>
            </div>
            ` : ''}
        </div>
        ` : ''}
        
        <div class="footer">
            <p><strong>Reçu généré le ${formatDate(new Date().toISOString())}</strong></p>
            <p class="footer-note">
                Ce document certifie l'achat et le paiement des articles scolaires mentionnés ci-dessus.
                Veuillez conserver ce reçu pour vos dossiers.
            </p>
        </div>
    </div>
</body>
</html>
    `;
};

// Generate PDF and return file URI
export const generateSchoolFeePDF = async (payment: SchoolFeesPaymentHistoryDto): Promise<{ uri: string; fileName: string }> => {
    const html = generateSchoolFeeHTML(payment);

    // Generate PDF
    const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
    });

    // Create a better filename with date and child name
    const timestamp = new Date().getTime();
    const fileName = `Recu_Frais_Scolaires_${payment.childFullName.replace(/\s+/g, '_')}_${timestamp}.pdf`;

    // Save to device temporary location
    let fileUri = uri;

    if (Platform.OS === 'android') {
        const downloadDir = FileSystem.documentDirectory + fileName;
        await FileSystem.copyAsync({
            from: uri,
            to: downloadDir
        });
        fileUri = downloadDir;
    }

    return { uri: fileUri, fileName };
};

// Save PDF to Downloads folder
// Share PDF
export const sharePDF = async (fileUri: string): Promise<void> => {
    try {
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
            await Sharing.shareAsync(fileUri, {
                mimeType: 'application/pdf',
                dialogTitle: 'Partager le reçu',
                UTI: 'com.adobe.pdf',
            });
            console.log('✅ PDF shared successfully');
        } else {
            Alert.alert(
                'Erreur',
                'Le partage n\'est pas disponible sur cet appareil.',
                [{ text: 'OK' }]
            );
        }
    } catch (shareError) {
        console.error('❌ Error sharing PDF:', shareError);
        Alert.alert(
            'Erreur',
            'Impossible de partager le fichier.',
            [{ text: 'OK' }]
        );
    }
};

// Generate Merchandise PDF and return file URI
export const generateMerchandisePDF = async (payment: MerchandisePaymentHistoryDto): Promise<{ uri: string; fileName: string }> => {
    const html = generateMerchandiseHTML(payment);

    // Generate PDF
    const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
    });

    // Create a better filename with date
    const timestamp = new Date().getTime();
    const fileName = `Recu_Articles_${timestamp}.pdf`;

    // Save to device temporary location
    let fileUri = uri;

    if (Platform.OS === 'android') {
        const downloadDir = FileSystem.documentDirectory + fileName;
        await FileSystem.copyAsync({
            from: uri,
            to: downloadDir
        });
        fileUri = downloadDir;
    }

    return { uri: fileUri, fileName };
};
