import moment from 'moment-timezone';

export const formatISTHourSlot = (utcHourStart: any) => {
    const start = moment.utc(utcHourStart).tz('Asia/Kolkata');
    const end = start.clone().add(1, 'hour');
    return `${start.format('hh:mm A')} - ${end.format('hh:mm A')} IST`;
}
