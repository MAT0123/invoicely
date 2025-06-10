import { InvoiceData } from '../types/invoiceTypes';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
  Font,
  pdf,
  Image,
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
  },

  companyInfo: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },

  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },

  companyDetails: {
    fontSize: 10,
    color: '#333333',
    lineHeight: 1.4,
  },

  invoiceTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'right',
  },

  invoiceDetails: {
    fontSize: 10,
    color: '#333333',
    textAlign: 'right',
    marginTop: 8,
    lineHeight: 1.4,
  },

  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },

  clientInfo: {
    flexDirection: 'column',
    width: '45%',
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
    textTransform: 'uppercase',
  },

  clientDetails: {
    fontSize: 10,
    color: '#333333',
    lineHeight: 1.4,
  },

  // Items Table
  table: {
    marginBottom: 30,
  },

  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#000000',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },

  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },

  tableCell: {
    fontSize: 9,
    color: '#333333',
    paddingHorizontal: 4,
  },

  tableCellHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000000',
    paddingHorizontal: 4,
  },

  // Column widths
  descriptionColumn: { width: '50%' },
  quantityColumn: { width: '15%', textAlign: 'center' },
  rateColumn: { width: '17.5%', textAlign: 'right' },
  amountColumn: { width: '17.5%', textAlign: 'right' },

  totalsSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 30,
  },

  totalsTable: {
    width: '40%',
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },

  totalRowFinal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#000000',
    marginTop: 4,
  },

  totalLabel: {
    fontSize: 10,
    color: '#333333',
  },

  totalValue: {
    fontSize: 10,
    color: '#333333',
    fontWeight: 'bold',
  },

  totalLabelFinal: {
    fontSize: 12,
    color: '#000000',
    fontWeight: 'bold',
  },

  totalValueFinal: {
    fontSize: 12,
    color: '#000000',
    fontWeight: 'bold',
  },

  notesSection: {
    marginBottom: 20,
  },

  notesTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },

  notesText: {
    fontSize: 10,
    color: '#333333',
    lineHeight: 1.4,
  },

  footer: {
    marginTop: 'auto',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#cccccc',
    textAlign: 'center',
  },

  footerText: {
    fontSize: 8,
    color: '#666666',
  },
});
export const InvoicePDF: React.FC<{ invoice: InvoiceData; image?: string }> = ({
  invoice,
  image,
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View style={styles.companyInfo}>
          <Text style={styles.companyName}>{invoice.companyName}</Text>
          <Text style={styles.companyDetails}>
            {invoice.companyAddress}
            {'\n'}
            Phone: {invoice.companyPhone}
            {'\n'}
            Email: {invoice.companyEmail}
          </Text>
        </View>
        <View>
          {image && (
            <Image
              src={image}
              style={{ width: 80, height: 80, marginBottom: 8 }}

            />
          )}
          <Text style={styles.invoiceTitle}>INVOICE</Text>
          <Text style={styles.invoiceDetails}>
            Invoice #: {invoice.invoiceNumber}
            {'\n'}
            Date: {invoice.invoiceDate}
            {'\n'}
            Due Date: {invoice.dueDate}
          </Text>
        </View>
      </View>

      <View style={styles.infoSection}>
        <View style={styles.clientInfo}>
          <Text style={styles.sectionTitle}>Bill To:</Text>
          <Text style={styles.clientDetails}>
            {invoice.clientName}
            {'\n'}
            {invoice.clientAddress}
            {'\n'}
            Phone: {invoice.clientPhone}
            {'\n'}
            Email: {invoice.clientEmail}
          </Text>
        </View>
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableCellHeader, styles.descriptionColumn]}>
            Description
          </Text>
          <Text style={[styles.tableCellHeader, styles.quantityColumn]}>
            Qty
          </Text>
          <Text style={[styles.tableCellHeader, styles.rateColumn]}>Rate</Text>
          <Text style={[styles.tableCellHeader, styles.amountColumn]}>
            Amount
          </Text>
        </View>

        {invoice.items.map((item) => (
          <View key={item.id} style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.descriptionColumn]}>
              {item.description}
            </Text>
            <Text style={[styles.tableCell, styles.quantityColumn]}>
              {item.quantity}
            </Text>
            <Text style={[styles.tableCell, styles.rateColumn]}>
              ${item.rate.toFixed(2)}
            </Text>
            <Text style={[styles.tableCell, styles.amountColumn]}>
              ${item.amount.toFixed(2)}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.totalsSection}>
        <View style={styles.totalsTable}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>
              ${invoice.subtotal.toFixed(2)}
            </Text>
          </View>

          {invoice.discount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Discount:</Text>
              <Text style={styles.totalValue}>
                -${invoice.discount.toFixed(2)}
              </Text>
            </View>
          )}

          {invoice.tax > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax ({invoice.taxRate}%):</Text>
              <Text style={styles.totalValue}>${invoice.tax.toFixed(2)}</Text>
            </View>
          )}

          <View style={styles.totalRowFinal}>
            <Text style={styles.totalLabelFinal}>Total:</Text>
            <Text style={styles.totalValueFinal}>
              ${invoice.total.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      {invoice.notes && (
        <View style={styles.notesSection}>
          <Text style={styles.notesTitle}>Notes:</Text>
          <Text style={styles.notesText}>{invoice.notes}</Text>
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>{invoice.notes}</Text>
      </View>
    </Page>
  </Document>
);
