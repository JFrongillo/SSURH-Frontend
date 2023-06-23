import axios from 'axios'

const SERVER_URL = 'https://2d48dnzisg.execute-api.us-east-1.amazonaws.com/prod/api';

export const login = (data) => axios.post(`${SERVER_URL}/login/`, data);
export const signup = (data) => axios.post(`${SERVER_URL}/signup/`, data);
export const verify = (data) => axios.put(`${SERVER_URL}/verify/${data}`, data);

export const grabUserInfo = (userId) => axios.get(`${SERVER_URL}/profiles/${userId}`,userId);
export const grabResearch = (researchId) => axios.get(`${SERVER_URL}/research/${researchId}`, researchId)
export const allFaculty = () => axios.get(`${SERVER_URL}/profiles/`);
export const allResearch = () => axios.get(`${SERVER_URL}/research/`);

export const editUserInfo = (userId, data) => axios.put(`${SERVER_URL}/profiles/edit/${userId}`, data);
export const uploadAvatar = (userId, file) => axios.post(`${SERVER_URL}/profiles/${userId}/upload_avatar`, file);
export const editResearch = (resId, data) => axios.put(`${SERVER_URL}/research/${resId}/update`, data)
export const emailLookup = (email) => axios.get(`${SERVER_URL}/profiles/email_lookup/${email}`)
export const generateTempPassword = (data) => axios.put(`${SERVER_URL}/login/issue_temp_password`, data)
export const updatePassword = (userId,data) => axios.put(`${SERVER_URL}/profiles/update_password/${userId}`, data)

export const facultyOwnedResearch = (userId) => axios.get(`${SERVER_URL}/research/owned_by/${userId}`, userId)

export const createResearch = (userId,data) => axios.post(`${SERVER_URL}/research/${userId}/create`, data)

export const allStudents = () => axios.get(`${SERVER_URL}/student`)
export const createStudent = (data) => axios.post(`${SERVER_URL}/student/new_student`, data)
export const grabStudentBysID = (sID) => axios.get(`${SERVER_URL}/student/find_by_sID/${sID}`)
export const grabStudentByObjectID = (stuId) => axios.get(`${SERVER_URL}/student/${stuId}`)
export const uploadResume = (stuId,data) => axios.post(`${SERVER_URL}/student/${stuId}/upload_resume`,data)
export const apply = (resId, data) => axios.post(`${SERVER_URL}/research/${resId}/apply`, data)
export const updateStudent = (stuId, data) => axios.put(`${SERVER_URL}/student/${stuId}/update`,data)
export const accept = (resId, applicationId) => axios.put(`${SERVER_URL}/research/${resId}/accept`, { appId: applicationId });
export const deny = (resId, applicationId) => axios.delete(`${SERVER_URL}/research/${resId}/deny/${applicationId}`);


export const deleteResearch = (resid) => axios.delete(`${SERVER_URL}/research/${resid}/delete`)
export const deleteStudent = (stuId) => axios.delete(`${SERVER_URL}/student/${stuId}/delete`)