import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import toast, { Toaster } from "react-hot-toast";

type WorkLog = {
  id: number;
  date: string;
  workType: string;
  volume: number;
  unit: string;
  workerName: string;
};

function App() {
  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [workerFilter, setWorkerFilter] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    date: "",
    workType: "",
    volume: "",
    unit: "",
    workerName: "",
  });

  const units = [
    "м",
    "м²",
    "м³",
    "шт",
    "т",
    "кг",
    "л",
    "компл",
    "п.м",
    "рейс",
    "смена",
    "день",
    "час",
    "секция",
    "блок",
    "лист",
    "упаковка",
  ];

  const workTypes = [
    "Кладка перегородок",
    "Монтаж опалубки",
    "Армирование",
    "Бетонирование",
    "Штукатурка",
    "Электромонтаж",
    "Монтаж окон",
    "Сварочные работы",
    "Устройство кровли",
    "Земляные работы",
  ];

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const response = await axios.get(
          // "http://localhost:5000/logs"
          "https://construction-journal.onrender.com/logs"
        );

        setLogs(response.data);
      } catch (error) {
        console.error(error);
        toast.error("Произошла ошибка");
      }
    };

    loadLogs();
  }, []);

  const refreshLogs = async () => {
    setLoading(true);

    try {
      const response = await axios.get("https://construction-journal.onrender.com/logs");
      setLogs(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Ошибка загрузки данных");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      if (editingId) {
        await axios.put(
          `https://construction-journal.onrender.com/logs/${editingId}`,
          {
            ...formData,
            volume: Number(formData.volume),
          }
        );
      } else {
        await axios.post(
          "https://construction-journal.onrender.com/logs",
          {
            ...formData,
            volume: Number(formData.volume),
          }
        );
      }

      setFormData({
        date: "",
        workType: "",
        volume: "",
        unit: "",
        workerName: "",
      });

      setEditingId(null);

      refreshLogs();

      toast.success(
        editingId
          ? "Запись обновлена"
          : "Запись добавлена"
      );
    } catch (error) {
      console.error(error);
      toast.error("Произошла ошибка");
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Удалить запись?"
    );

    if (!confirmed) return;
    try {
      await axios.delete(`https://construction-journal.onrender.com/logs/${id}`);
      refreshLogs();
      toast.success("Запись удалена");
    } catch (error) {
      console.error(error);
      toast.error("Произошла ошибка");
    }
  };

  const handleEdit = (log: WorkLog) => {
    setEditingId(log.id);

    setFormData({
      date: new Date(log.date)
        .toISOString()
        .split("T")[0],

      workType: log.workType,

      volume: String(log.volume),

      unit: log.unit,

      workerName: log.workerName,
    });
  };

  const filteredLogs = logs.filter((log) => {
    const logDate = new Date(log.date)
      .toISOString()
      .split("T")[0];

    const matchesStart =
      !startDate || logDate >= startDate;

    const matchesEnd =
      !endDate || logDate <= endDate;

    const matchesWorker =
      !workerFilter ||
      log.workerName
        .toLowerCase()
        .includes(workerFilter.toLowerCase());

    return (
      matchesStart &&
      matchesEnd &&
      matchesWorker
    );
  });

  return (
    <div className="container">
      <Toaster position="top-right" />
      <h1>Журнал работ</h1>
      <div className="filters">
        <input
          type="date"
          value={startDate}
          onChange={(e) =>
            setStartDate(e.target.value)
          }
        />

        <input
          type="date"
          value={endDate}
          onChange={(e) =>
            setEndDate(e.target.value)
          }
        />

        <input
          type="text"
          placeholder="Поиск по исполнителю"
          value={workerFilter}
          onChange={(e) =>
            setWorkerFilter(e.target.value)
          }
        />

        <button
          onClick={() => {
            setStartDate("");
            setEndDate("");
            setWorkerFilter("");
          }}
        >
          Сбросить
        </button>
      </div>

      {loading && <p>Загрузка...</p>}
      <form onSubmit={handleSubmit} className="form">
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />

        <select
          name="workType"
          value={formData.workType}
          onChange={(e) =>
            setFormData({
              ...formData,
              workType: e.target.value,
            })
          }
          required
        >
          <option value="">
            Выберите вид работ
          </option>

          {workTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <input
          type="number"
          name="volume"
          placeholder="Объем"
          value={formData.volume}
          onChange={handleChange}
          required
        />

        <select
          name="unit"
          value={formData.unit}
          onChange={(e) =>
            setFormData({
              ...formData,
              unit: e.target.value,
            })
          }
          required
        >
          <option value="">
            Выберите единицу
          </option>

          {units.map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </select>

        <input
          type="text"
          name="workerName"
          placeholder="ФИО исполнителя"
          value={formData.workerName}
          onChange={handleChange}
          required
        />

        <button className="primary" type="submit">Добавить</button>
      </form>
      <table>
        <thead>
          <tr>
            <th>Дата</th>
            <th>Вид работ</th>
            <th>Объем</th>
            <th>Исполнитель</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {filteredLogs.length === 0 && !loading ? (
            <tr>
              <td colSpan={5} style={{ textAlign: "center" }}>
                Нет записей
              </td>
            </tr>
          ) : (
            filteredLogs.map((log) => (
              <tr key={log.id}>
                <td>
                  {new Date(log.date).toLocaleDateString()}
                </td>

                <td>{log.workType}</td>

                <td>
                  {log.volume} {log.unit}</td>

                <td>{log.workerName}</td>

                <td style={{ display: "flex", gap: "8px" }}>
                  <button
                    className="edit"
                    onClick={() => handleEdit(log)}
                  >
                    Редактировать
                  </button>

                  <button
                    className="delete"
                    onClick={() => handleDelete(log.id)}
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;