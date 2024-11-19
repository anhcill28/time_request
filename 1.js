document.addEventListener("DOMContentLoaded", function () {
  // Kiểm tra trạng thái giao diện sáng/tối
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-theme");
  }

  // Danh sách các kỳ thi
  const exams = [
    { subject: "Các công nghệ hiện đại", date: "2024-11-28T09:00:00" },
    { subject: "Phân tích và thiết kế hệ thống", date: "2024-11-30T13:00:00" },
    { subject: "Hệ thống thương mại điện tử", date: "2024-12-04T07:00:00" },
    { subject: "Lịch sử Đảng Cộng sản Việt Nam", date: "2024-12-07T14:30:00" },
    { subject: "Tư tưởng Hồ Chí Minh", date: "2024-12-08T16:00:00" },
    { subject: "Hệ quản trị cơ sở dữ liệu", date: "2024-12-11T09:00:00" },
    { subject: "Marketing trực tuyến", date: "2024-12-12T09:00:00" },
    { subject: "Hệ thống thông tin quản lý", date: "2024-12-12T13:00:00" },
    { subject: "Lập trình Java", date: "2024-12-14T07:00:00" },
  ];

  const countdownsContainer = document.getElementById("countdown-container");
  const resultTableBody = document.querySelector("#result-table tbody");
  const completedExams = new Set(
    JSON.parse(localStorage.getItem("completedExams")) || []
  );

  // Tạo các countdown cho từng kỳ thi
  exams.forEach((exam, index) => {
    const examDiv = document.createElement("div");
    examDiv.className = "countdown";
    examDiv.innerHTML = `
          <p>${exam.subject} (${formatDateTime(exam.date)})</p>
          <p id="timer-${index}" class="timer">Đang tính toán...</p>
        `;

    examDiv.addEventListener("click", () =>
      openGradeInput(exam.subject, index)
    );
    countdownsContainer.appendChild(examDiv);

    startCountdown(exam.date, `timer-${index}`);
  });

  // Tải lại bảng điểm từ localStorage
  loadResultTable();

  function openGradeInput(subject, index) {
    document.getElementById(
      "subject-name"
    ).textContent = `Nhập điểm cho: ${subject}`;
    document.getElementById("grade-input-modal").classList.add("active");
    document.getElementById("save-grade-btn").setAttribute("data-index", index);
    loadSavedGrades(index);
  }

  document
    .getElementById("save-grade-btn")
    .addEventListener("click", function (event) {
      event.preventDefault();
      const index = this.getAttribute("data-index");
      const grade10 =
        parseFloat(document.getElementById("grade-10").value) || 0;
      const grade40 =
        parseFloat(document.getElementById("grade-40").value) || 0;
      const grade50 =
        parseFloat(document.getElementById("grade-50").value) || 0;

      if (validateGrades(grade10, grade40, grade50)) {
        const totalGrade = calculateTotalGrade(grade10, grade40, grade50);
        document.getElementById(
          "result"
        ).textContent = `Tổng điểm môn ${exams[index].subject}: ${totalGrade}`;
        saveGrades(index, grade10, grade40, grade50, totalGrade);
        updateResultTable(index, grade10, grade40, grade50, totalGrade);
        completedExams.add(index);
        updateCompletedCount();
        localStorage.setItem(
          "completedExams",
          JSON.stringify([...completedExams])
        );
        closeModal();
      }
    });

  document.getElementById("close-btn").addEventListener("click", closeModal);

  // Xử lý sự kiện reset
  document.getElementById("reset-btn").addEventListener("click", function () {
    if (confirm("Bạn có chắc muốn xóa toàn bộ dữ liệu và bắt đầu lại không?")) {
      resetAllData();
    }
  });

  function calculateTotalGrade(grade10, grade40, grade50) {
    return (grade10 * 0.1 + grade40 * 0.4 + grade50 * 0.5).toFixed(2);
  }

  function validateGrades(grade10, grade40, grade50) {
    if (
      grade10 < 0 ||
      grade10 > 10 ||
      grade40 < 0 ||
      grade40 > 10 ||
      grade50 < 0 ||
      grade50 > 10
    ) {
      alert("Điểm phải nằm trong khoảng từ 0 đến 10.");
      return false;
    }
    return true;
  }

  function updateResultTable(index, grade10, grade40, grade50, totalGrade) {
    const row = document.createElement("tr");
    const grade4Scale = ((totalGrade / 10) * 4).toFixed(2);
    const classification = classifyGrade(grade4Scale);

    row.innerHTML = `
          <td>${exams[index].subject}</td>
          <td>${grade10}</td>
          <td>${grade40}</td>
          <td>${grade50}</td>
          <td>${totalGrade}</td>
          <td>${grade4Scale}</td>
          <td>${classification}</td>
        `;

    // Trước khi thêm dòng mới, xóa các dòng cũ của môn này (nếu có)
    const existingRow = resultTableBody.querySelector(
      `tr[data-index="${index}"]`
    );
    if (existingRow) {
      resultTableBody.removeChild(existingRow);
    }

    row.setAttribute("data-index", index); // Gắn thuộc tính để dễ dàng nhận diện
    resultTableBody.appendChild(row);
    localStorage.setItem("resultTable", resultTableBody.innerHTML);
  }

  function loadResultTable() {
    const savedResultTable = localStorage.getItem("resultTable");
    if (savedResultTable) {
      resultTableBody.innerHTML = savedResultTable;
    }
  }

  function classifyGrade(grade4Scale) {
    if (grade4Scale >= 3.7) return "A+";
    if (grade4Scale >= 3.5) return "A";
    if (grade4Scale >= 3.0) return "B+";
    if (grade4Scale >= 2.5) return "B";
    if (grade4Scale >= 2.0) return "C";
    return "D";
  }

  function closeModal() {
    document.getElementById("grade-input-modal").classList.remove("active");
    clearInputs();
  }

  function clearInputs() {
    document.getElementById("grade-10").value = "";
    document.getElementById("grade-40").value = "";
    document.getElementById("grade-50").value = "";
    document.getElementById("result").textContent = "";
  }

  function saveGrades(index, grade10, grade40, grade50, totalGrade) {
    const grades = { grade10, grade40, grade50, totalGrade };
    localStorage.setItem(`grades-${index}`, JSON.stringify(grades));
  }

  function loadSavedGrades(index) {
    const savedGrades = JSON.parse(localStorage.getItem(`grades-${index}`));
    if (savedGrades) {
      document.getElementById("grade-10").value = savedGrades.grade10;
      document.getElementById("grade-40").value = savedGrades.grade40;
      document.getElementById("grade-50").value = savedGrades.grade50;
      document.getElementById(
        "result"
      ).textContent = `Tổng điểm đã lưu: ${savedGrades.totalGrade}`;
    }
  }

  function formatDateTime(dateTime) {
    const date = new Date(dateTime);
    const formattedDate = `${date.getDate().toString().padStart(2, "0")}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`;
    const formattedTime = `${date.getHours().toString().padStart(2, "0")}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
    return `${formattedDate} ${formattedTime}`;
  }

  function startCountdown(endDateTime, elementId) {
    const countdownInterval = setInterval(function () {
      const now = new Date().getTime();
      const distance = new Date(endDateTime).getTime() - now;

      if (distance <= 0) {
        clearInterval(countdownInterval);
        document.getElementById(elementId).textContent = "Đã đến giờ thi!";
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById(
          elementId
        ).textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
      }
    }, 1000);
  }

  function updateCompletedCount() {
    document.getElementById("completed-exams").textContent =
      completedExams.size;
  }

  // Cập nhật số lượng bài kiểm tra đã hoàn thành khi tải trang
  updateCompletedCount();

  // Hàm xóa toàn bộ dữ liệu
  function resetAllData() {
    localStorage.removeItem("completedExams");
    localStorage.removeItem("resultTable");

    completedExams.clear();
    resultTableBody.innerHTML = "";
    updateCompletedCount();
  }
});
document.addEventListener("DOMContentLoaded", function () {
  // Danh sách các kỳ thi với thông tin môn học, phòng thi, ngày thi và giờ thi
  const examRooms = [
    {
      subject: "Các công nghệ hiện đại",
      room: "C-101",
      date: "2024-11-28",
      time: "09:00",
    },
    {
      subject: "Phân tích và thiết kế hệ thống",
      room: "C-206",
      date: "2024-11-30",
      time: "13:00",
    },
    {
      subject: "Hệ thống thương mại điện tử",
      room: "A2-613",
      date: "2024-12-04",
      time: "07:00",
    },
    {
      subject: "Lịch sử Đảng Cộng sản Việt Nam",
      room: "A2-609",
      date: "2024-12-07",
      time: "14:30",
    },
    {
      subject: "Tư tưởng Hồ Chí Minh",
      room: "A2-613",
      date: "2024-12-08",
      time: "16:00",
    },
    {
      subject: "Hệ quản trị cơ sở dữ liệu",
      room: "A2-613",
      date: "2024-12-11",
      time: "09:00",
    },
    {
      subject: "Marketing trực tuyến",
      room: "C-301",
      date: "2024-12-12",
      time: "09:00",
    },
    {
      subject: "Hệ thống thông tin quản lý",
      room: "A2-603",
      date: "2024-12-12",
      time: "13:00",
    },
    {
      subject: "Lập trình Java",
      room: "A2-615",
      date: "2024-12-14",
      time: "07:00",
    },
  ];

  const roomTableBody = document.querySelector("#room-table tbody");

  // Chạy qua danh sách kỳ thi và thêm các hàng vào bảng phòng thi
  examRooms.forEach((exam) => {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${exam.subject}</td>
        <td>${exam.room}</td>
        <td>${exam.date}</td>
        <td>${exam.time}</td>
      `;
    roomTableBody.appendChild(row);
  });
});
