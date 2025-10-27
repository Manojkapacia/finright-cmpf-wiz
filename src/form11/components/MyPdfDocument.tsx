import DejaVuSans from './../fonts/DejaVuSans.ttf';
import moment from 'moment';
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Font,
} from '@react-pdf/renderer';

Font.register({
    family: 'DejaVuSans',
    src: DejaVuSans,
});

const styles = StyleSheet.create({
    page: { padding: 30, fontSize: 9, fontFamily: 'Helvetica' },
    heading: { fontSize: 11, textAlign: 'center', marginBottom: 2, fontWeight: 'bold' },
    subheading: { fontSize: 9, textAlign: 'center', marginBottom: 10 },
    sectionTitle: {
        marginTop: 10,
        fontSize: 10,
        fontWeight: 'bold',
        textDecoration: 'underline',
    },
    tableRow: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: '#000',
    },
    colNumber: {
        width: '8%',
        padding: 4,
        borderRightWidth: 1,
        borderColor: '#000',
        justifyContent: 'center',
        textAlign: 'center'
    },
    colLabel: {
        width: '52%',
        padding: 4,
        borderRightWidth: 1,
        borderColor: '#000',
    },
    colValue: {
        width: '40%',
        padding: 4,
    },
    inlineRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8,
    },
    box: {
        width: 12,
        height: 12,
        borderWidth: 1,
        borderColor: '#000',
        position: 'relative',
        marginLeft: 4,
        marginRight: 8,
    },
    check: {
        position: 'absolute',
        color: '#000',
        top: -2,
        fontSize: 15,
        fontFamily: 'DejaVuSans',
    },
    helperText: {
        marginTop: 4,
        fontSize: 8,
        color: '#333',
    },
});

const MyPdfDocument = ({ currentUanData, kycData }: { currentUanData: any, kycData: any }) => {
    const profile = currentUanData?.rawData?.data?.profile || {};
    const serviceHistory = currentUanData?.rawData?.data?.serviceHistory?.history[0]?.details?.['Member Id'] || {};
    const fullName = kycData?.name?.value || '-';
    const dob = kycData?.dob?.value || '-';
    // const genderCode = profile?.basicDetails?.gender || '-';
    // const gender = genderCode === 'M' ? 'Male' : genderCode === 'F' ? 'Female' : genderCode === 'T' ? 'Transgender' : '-';
    const gender = kycData?.gender?.value || '-';
    const fatherName = kycData?.spouseFatherName?.value || '-';
    const isFather = profile?.basicDetails?.relation === 'F';
    const spouseName = !isFather ? fatherName : '-';

    const email = kycData?.contactDetails?.email?.value || '-';
    const mobile = kycData?.contactDetails?.contactNumber?.value || '-';
    const maritalStatus = kycData?.maritalStatus?.value || '-';
    const internationalWorker = profile?.basicDetails?.internationalWorker || 'N'; 
    const isInternationalWorker = internationalWorker === 'Y';
    const UAN = profile?.UAN;
    const pfAccount= serviceHistory
    const exitDate = currentUanData?.rawData?.data?.serviceHistory?.history[0]?.company?.details?.['Exit Date']?.trim();

    const isInvalid = !exitDate || ['-', 'NA', 'N/A', ''].includes(exitDate.toUpperCase());

    let DOElatestCompany = 'DOE not Marked';

    if (!isInvalid) {
        const parsedDate = moment(new Date(exitDate));

        if (parsedDate.isValid()) {
            DOElatestCompany = parsedDate.format('DD/MM/YYYY');
        }
    }
    
    const kycDetails = {
        bank: `${profile?.kycDetails?.bankAccountNumber || '-'} / ${profile?.kycDetails?.bankIFSC || '-'}`,
        aadhaar: profile?.kycDetails?.aadhaar || '-',
        pan: profile?.kycDetails?.pan || '-',
    };



    const specialRow = (
        <View style={[styles.tableRow, { borderTopWidth: 0 , borderBottomWidth: 0}]}>
            <Text style={styles.colNumber}>2.</Text>
            <View style={styles.colLabel}>
                <View style={styles.inlineRow}>
                    <Text>Father’s Name</Text>
                    <View style={styles.box}>
                        {isFather && <Text style={styles.check}>{'\u2713'}</Text>}
                    </View>
                    <Text>Spouse Name</Text>
                    <View style={styles.box}>
                        {!isFather && <Text style={styles.check}>{'\u2713'}</Text>}
                    </View>
                </View>
                <Text style={styles.helperText}>Please tick whichever is applicable</Text>
            </View>
            <Text style={styles.colValue}>{isFather ? fatherName : spouseName}</Text>
        </View>
    );

    const mainDetails = [
        { no: '1.', label: 'Name of Member', value: fullName },
        { no: '3.', label: 'Date of Birth (DD/MM/YYYY)', value: dob },
        { no: '4.', label: 'Gender (Male/Female/Transgender)', value: gender },
        { no: '5.', label: 'Marital Status (Married/Unmarried/Widow/Divorcee)', value: maritalStatus },
        { no: '7.', label: 'Member of Employees’ Provident Fund Scheme, 1952', value: 'No' },
        { no: '8.', label: 'Member of Employees’ Pension Scheme, 1995', value: 'Yes' },
    ];

    const renderRows = (data: any[], extraStyle = {}) =>
        data.map((item, i) => {
            const isLast = i === data.length - 1;

            const rowStyle = [
                styles.tableRow,
                !isLast && { borderBottomWidth: 0 }, // remove bottom border if not last
                i === 0 && extraStyle,               // optional extra styling for first row
            ];

            return (
                <View style={rowStyle} key={i}>
                    <Text style={[styles.colNumber,{ justifyContent: 'center', textAlign: 'center' }]}>{item.no}</Text>
                    <Text style={styles.colLabel}>{item.label}</Text>
                    <Text style={styles.colValue}>{item.value || '-'}</Text>
                </View>
            );
        });



    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <Text style={styles.heading}>EMPLOYEES’ PROVIDENT FUND ORGANISATION</Text>
                <Text style={{ fontWeight: 'bold', fontSize: 10, textAlign: 'center' }}>
                    Employees’ Provident Fund Scheme, 1952 (Paragraph 34 & 57) &
                </Text>
                <Text style={{ fontWeight: 'bold', fontSize: 10, textAlign: 'center' }}>
                    Employees’ Pension Scheme, 1995 (Paragraph 24)
                </Text>

                <Text style={styles.subheading}>
                    (Declaration by a person taking up employment in any establishment on which EPF Scheme, 1952 and/or EPS, 1995 is applicable)
                </Text>

                {renderRows([mainDetails[0]])}
                {specialRow}
                {renderRows(mainDetails.slice(1, 4))}

                <View style={[styles.tableRow, { borderTopWidth: 0 }]}>
                    <Text style={styles.colNumber}>6.</Text>
                    <View style={styles.colLabel}>
                        <Text>(a.) Email ID:</Text>
                        <Text style={{ marginTop: 3 }}>(b.) Mobile No.:</Text>
                    </View>
                    <View style={styles.colValue}>
                        <Text>{email}</Text>
                        <Text style={{ marginTop: 3 }}>{mobile}</Text>
                    </View>
                </View>

                {renderRows(mainDetails.slice(4, 6), { borderTopWidth: 0 })}


                <View style={[styles.tableRow, { borderTopWidth: 0 }]}>
                    <View style={[styles.colNumber, { justifyContent: 'center', alignItems: 'center' }]}>
                        <Text>9.</Text>
                    </View>

                    <View style={{ flexDirection: 'column', width: '92%' }}>
                        <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: '#000' }}>
                            <View style={{ width: '56.55%', padding: 4, borderRightWidth: 1, borderColor: '#000' }}>
                                <Text style={{ fontWeight: 'bold' }}>Previous employment details: [if Yes to 7 AND/OR 8 above]</Text>
                                <Text style={{ marginTop: 4 }}>a) Universal Account Number</Text>
                            </View>
                            <View style={{ width: '40%', padding: 4 }}>
                                <Text style={{ marginTop: 7 }}>{UAN}</Text>
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: '#000' }}>
                            <View style={{ width: '56.55%', padding: 4, borderRightWidth: 1, borderColor: '#000' }}>
                                <Text>b) Previous PF Account Number</Text>
                            </View>
                            <View style={{ width: '40%', padding: 4 }}>
                                <Text>{pfAccount}</Text>
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: '#000' }}>
                            <View style={{ width: '56.55%', padding: 4, borderRightWidth: 1, borderColor: '#000' }}>
                                <Text>c) Date of Exit from Previous Employment (DD/MM/YYYY)</Text>
                            </View>
                            <View style={{ width: '40%', padding: 4 }}>
                                <Text>{DOElatestCompany}</Text>
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: '#000' }}>
                            <View style={{ width: '56.55%', padding: 4, borderRightWidth: 1, borderColor: '#000' }}>
                                <Text>d) Scheme Certificate No. (if issued)</Text>
                            </View>
                            <View style={{ width: '40%', padding: 4 }}>
                                <Text>No</Text>
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ width: '56.55%', padding: 4, borderRightWidth: 1, borderColor: '#000' }}>
                                <Text>e) Pension Payment Order (PPO) No. (if issued)</Text>
                            </View>
                            <View style={{ width: '40%', padding: 4 }}>
                                <Text>No</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={[styles.tableRow, { borderTopWidth: 0 }]}>
                    <View style={[styles.colNumber, { justifyContent: 'center', alignItems: 'center' }]}>
                        <Text>10.</Text>
                    </View>

                    <View style={{ flexDirection: 'column', width: '92%' }}>
                        <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: '#000' }}>
                            <View style={{ width: '56.55%', padding: 4, borderRightWidth: 1, borderColor: '#000' }}>
                                <Text style={{ marginTop: 4 }}>a) International Worker</Text>
                            </View>
                            <View style={{ width: '40%', padding: 4 }}>
                                <Text>{isInternationalWorker ? 'Yes' : 'No'}</Text>
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: '#000' }}>
                            <View style={{ width: '56.55%', padding: 4, borderRightWidth: 1, borderColor: '#000' }}>
                                <Text>b) Country of Origin (India/Other) </Text>
                            </View>
                            <View style={{ width: '40%', padding: 4 }}>
                                <Text>No</Text>
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: '#000' }}>
                            <View style={{ width: '56.55%', padding: 4, borderRightWidth: 1, borderColor: '#000' }}>
                                <Text>c) Passport Number</Text>
                            </View>
                            <View style={{ width: '40%', padding: 4 }}>
                                <Text>No</Text>
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ width: '56.55%', padding: 4, borderRightWidth: 1, borderColor: '#000' }}>
                                <Text>d)  Passport Validity (DD/MM/YYYY to DD/MM/YYYY)</Text>
                            </View>
                            <View style={{ width: '40%', padding: 4 }}>
                                <Text>No</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={[styles.tableRow, { borderTopWidth: 0 }]}>
                    {/* Column 1 */}
                    <View style={[styles.colNumber, { justifyContent: 'center', alignItems: 'center' }]}>
                        <Text>11.</Text>
                    </View>

                    <View style={{ flexDirection: 'column', width: '92%' }}>
                        <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: '#000' }}>
                            <View style={{ width: '56.55%', padding: 4, borderRightWidth: 1, borderColor: '#000' }}>
                                <Text style={{ marginTop: 4 }}>
                                    <Text style={{ fontWeight: 'bold' }}>KYC Details:</Text> (Attach self-attested copies of following KYCs)
                                </Text>
                            </View>
                            <View style={{ width: '40%', padding: 4 }}>
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: '#000' }}>
                            <View style={{ width: '56.55%', padding: 4, borderRightWidth: 1, borderColor: '#000' }}>
                                <Text>a) Bank Account No. & IFSC Code </Text>
                            </View>
                            <View style={{ width: '40%', padding: 4 }}>
                                <Text>{kycDetails?.bank}</Text>
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: '#000' }}>
                            <View style={{ width: '56.55%', padding: 4, borderRightWidth: 1, borderColor: '#000' }}>
                                <Text>b) AADHAAR Number</Text>
                            </View>
                            <View style={{ width: '40%', padding: 4 }}>
                                <Text>{kycDetails?.aadhaar}</Text>
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ width: '56.55%', padding: 4, borderRightWidth: 1, borderColor: '#000' }}>
                                <Text>c)  Permanent Account Number (PAN), if available</Text>
                            </View>
                            <View style={{ width: '40%', padding: 4 }}>
                                <Text>{kycDetails?.pan}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </Page>
        </Document>
    );
};

export default MyPdfDocument;
