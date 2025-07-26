export interface GetParentDetailsParams {
    parentId: number;
}

export interface UpdateParentParams {
    parentId: number;
    firstName: string;
    lastName: string;
    email?: string;
    civilId?: string;
    fatherName?: string;
    countryCode: string;
    phoneNumber: string;
    statusId: number;
}

export interface School {
    schoolId: number;
    schoolName: string;
    schoolAddress: string;
    schoolPhoneNumber: string;
    schoolEmail: string;
    schoolEstablishedYear: number;
    schoolDescription: string;
    schoolWebsite: string;
    schoolLogo: string | null;
    schoolGradeSections: any | null;
    schoolMerchandises: any | null;
    childrens: any[];
    parentSchools: any | null;
    supportRequests: any | null;
    director: any | null;
    fK_StatusId: number;
    status: any | null;
    createdOn: string;
    modifiedOn: string | null;
}

export interface Child {
    childId: number;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    fatherName: string;
    fK_ParentId: number;
    fK_SchoolId: number;
    school: School;
    fK_StatusId: number;
    status: any | null;
    childGrades: any | null;
    createdOn: string;
    modifiedOn: string | null;
}

export interface ParentDetailsData {
    parentId: number;
    firstName: string;
    lastName: string;
    fatherName: string;
    countryCode: string;
    phoneNumber: string;
    civilId: string;
    email: string;
    oneSignalPlayerId: string;
    childrens: Child[];
    parentSchools: any | null;
    supportRequests: any | null;
    fK_StatusId: number;
    status: any | null;
    fK_UserId: string;
    createdOn: string;
    modifiedOn: string | null;
}


export interface GetParentDetailsResponse {
    data: ParentDetailsData;
    status: string;
    error: any | null;
    message: string | null;
}

export interface UpdateParentResponse {
    status: string;
    error: any | null;
    message: string | null;
}

