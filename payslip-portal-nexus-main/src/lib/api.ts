const BASE_URL = "http://localhost:8000/api/";

export async function loginAdmin(username: string, password: string) {
  const res = await fetch(`${BASE_URL}admin-login/`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return await res.json();
}

export async function loginEmployee(empno: string, dob: string) {
    const res = await fetch(`${BASE_URL}login/`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ empno, dob }),
    });
    return await res.json();
}

export async function getEmployeeDashboard(month?: string, year?: string) {
    const params = new URLSearchParams();
    if (month) params.append("month", month);
    if (year) params.append("year", year);
    const res = await fetch(`${BASE_URL}dashboard/?${params.toString()}`, {
        method: "GET",
        credentials: "include",
    });
    return await res.json();
}

export async function uploadPayslips(dbfFile: File) {
    const formData = new FormData();
    formData.append("dbf_file", dbfFile);
    const res = await fetch(`${BASE_URL}upload/`, {
        method: "POST",
        credentials: "include",
        body: formData,
    });
    return await res.json();
}
