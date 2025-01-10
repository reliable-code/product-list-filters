import { getStorageValue, setStorageValue } from '../../common/storage';
import { DoctorData } from '../models/doctorData';

export const STORAGE_KEYS = {
    LAST_DOCTOR_UPDATE: 'last-doctor-update',
};

export function setStoredReviewsData(doctorId, reviewsData) {
    const doctorStorageKey = getDoctorStorageKey(doctorId);
    const storedDoctor = getStorageValue(doctorStorageKey);
    const currentDoctor = getCurrentDoctor(storedDoctor);

    currentDoctor.reviewsData = reviewsData;
    currentDoctor.updateLastCheckDate();

    setStorageValue(doctorStorageKey, currentDoctor);
    setStorageValue(STORAGE_KEYS.LAST_DOCTOR_UPDATE, Date.now());
}

function getDoctorStorageKey(doctorId) {
    return `doctor-${doctorId}`;
}

function getCurrentDoctor(storedDoctor) {
    return storedDoctor ? DoctorData.fromObject(storedDoctor) : new DoctorData();
}

export function getStoredReviewsData(doctorId) {
    const doctorData = getStoredDoctorData(doctorId);
    return doctorData?.reviewsData ?? null;
}

export function getStoredDoctorData(doctorId) {
    const doctorStorageKey = getDoctorStorageKey(doctorId);
    return getStorageValue(doctorStorageKey);
}
