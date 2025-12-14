import React from "react";

interface Student {
  _id: string;
  name: string;
  email: string;
  username: string;
  club: {
    name: string;
  };
  prompts?: number;
  appsUnlocked?: string[];
}

interface StudentTableProps {
  students: Student[];
  onEdit: (student: Student) => void;
  onDelete: (id: string) => void;
}

const StudentTable: React.FC<StudentTableProps> = ({ students, onEdit, onDelete }) => (
  <div className="bg-white rounded-2xl shadow-lg drop-shadow-lg border-t-4 border-stem-blue p-4">
    <table className="w-full font-comic">
      <thead className="bg-stem-blue text-white">
        <tr>
          <th className="p-3">Name</th>
          <th className="p-3">Username</th>
          <th className="p-3">Email</th>
          <th className="p-3">Club</th>
          <th className="p-3">Prompts</th>
          <th className="p-3">Actions</th>
        </tr>
      </thead>
      <tbody>
        {students.map((s) => (
          <tr key={s._id} className="odd:bg-stem-light-gray hover:bg-stem-lime-green/10 transition">
            <td className="p-3 font-semibold text-stem-dark-gray">{s.name}</td>
            <td className="p-3 text-stem-medium-gray">{s.username}</td>
            <td className="p-3 text-stem-medium-gray">{s.email}</td>
            <td className="p-3">{s.club?.name || '-'}</td>
            <td className="p-3">{s.prompts || 0}</td>
            <td className="p-3">
              <button className="text-stem-blue hover:underline font-bold" onClick={() => onEdit(s)}>Edit</button>
              <button className="text-stem-red hover:underline ml-2 font-bold" onClick={() => onDelete(s._id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default StudentTable; 