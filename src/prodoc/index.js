import { getFirstElement } from '../common/dom/helpers';
import { initDoctorPageMods } from './pages/doctorPage';
import { initDoctorListMods } from './pages/doctorList';

const APPOINTMENTS_PAGE_SELECTOR = '.appointments_page';

const appointmentsPage = getFirstElement(APPOINTMENTS_PAGE_SELECTOR);

if (appointmentsPage) {
    initDoctorListMods(appointmentsPage);
} else {
    initDoctorPageMods();
}
