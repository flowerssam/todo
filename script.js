class TodoApp {
    constructor() {
        this.todos = this.loadTodos();
        this.currentView = 'list';
        this.currentDate = new Date();
        this.selectedDate = null;
        this.editingTodoId = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderTodos();
        this.setTodayDate();
    }

    setupEventListeners() {
        // 할 일 추가
        document.getElementById('addBtn').addEventListener('click', () => this.addTodo());
        document.getElementById('todoInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });

        // 뷰 전환
        document.getElementById('listViewBtn').addEventListener('click', () => this.switchView('list'));
        document.getElementById('calendarViewBtn').addEventListener('click', () => this.switchView('calendar'));

        // 달력 네비게이션
        document.getElementById('prevMonth').addEventListener('click', () => this.changeMonth(-1));
        document.getElementById('nextMonth').addEventListener('click', () => this.changeMonth(1));

        // 모달 관련
        document.querySelector('.close').addEventListener('click', () => this.closeModal());
        document.getElementById('saveEditBtn').addEventListener('click', () => this.saveEdit());
        document.getElementById('cancelEditBtn').addEventListener('click', () => this.closeModal());
        
        // 모달 외부 클릭 시 닫기
        window.addEventListener('click', (e) => {
            if (e.target === document.getElementById('editModal')) {
                this.closeModal();
            }
        });
    }

    setTodayDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('todoDate').value = today;
    }

    addTodo() {
        const input = document.getElementById('todoInput');
        const dateInput = document.getElementById('todoDate');
        const text = input.value.trim();
        const date = dateInput.value;

        if (!text) {
            alert('할 일을 입력해주세요!');
            return;
        }

        const todo = {
            id: Date.now(),
            text: text,
            date: date || new Date().toISOString().split('T')[0],
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.todos.push(todo);
        this.saveTodos();
        this.renderTodos();
        
        input.value = '';
        this.setTodayDate();
    }

    deleteTodo(id) {
        if (confirm('이 할 일을 삭제하시겠습니까?')) {
            this.todos = this.todos.filter(todo => todo.id !== id);
            this.saveTodos();
            this.renderTodos();
        }
    }

    toggleComplete(id) {
        const todo = this.todos.find(todo => todo.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.renderTodos();
        }
    }

    editTodo(id) {
        const todo = this.todos.find(todo => todo.id === id);
        if (todo) {
            this.editingTodoId = id;
            document.getElementById('editTodoInput').value = todo.text;
            document.getElementById('editTodoDate').value = todo.date;
            document.getElementById('editModal').style.display = 'block';
        }
    }

    saveEdit() {
        const text = document.getElementById('editTodoInput').value.trim();
        const date = document.getElementById('editTodoDate').value;

        if (!text) {
            alert('할 일을 입력해주세요!');
            return;
        }

        const todo = this.todos.find(todo => todo.id === this.editingTodoId);
        if (todo) {
            todo.text = text;
            todo.date = date;
            this.saveTodos();
            this.renderTodos();
            this.closeModal();
        }
    }

    closeModal() {
        document.getElementById('editModal').style.display = 'none';
        this.editingTodoId = null;
    }

    switchView(view) {
        this.currentView = view;
        
        // 버튼 활성화 상태 변경
        document.getElementById('listViewBtn').classList.toggle('active', view === 'list');
        document.getElementById('calendarViewBtn').classList.toggle('active', view === 'calendar');
        
        // 뷰 전환
        document.getElementById('listView').classList.toggle('active', view === 'list');
        document.getElementById('calendarView').classList.toggle('active', view === 'calendar');
        
        if (view === 'calendar') {
            // 달력 뷰로 전환할 때 오늘 날짜를 기본 선택
            if (!this.selectedDate) {
                this.selectedDate = new Date().toISOString().split('T')[0];
            }
            this.renderCalendar();
        }
    }

    renderTodos() {
        if (this.currentView === 'list') {
            this.renderListView();
        } else {
            this.renderCalendar();
        }
    }

    renderListView() {
        const todoList = document.getElementById('todoList');
        todoList.innerHTML = '';

        if (this.todos.length === 0) {
            todoList.innerHTML = '<div style="text-align: center; color: #636e72; padding: 40px;">아직 할 일이 없습니다.</div>';
            return;
        }

        // 날짜별로 정렬
        const sortedTodos = [...this.todos].sort((a, b) => new Date(a.date) - new Date(b.date));

        sortedTodos.forEach(todo => {
            const todoItem = document.createElement('div');
            todoItem.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            
            todoItem.innerHTML = `
                <div class="todo-content">
                    <div class="todo-text">${todo.text}</div>
                    <div class="todo-date">${this.formatDate(todo.date)}</div>
                </div>
                <div class="todo-actions">
                    <button class="complete-btn" onclick="todoApp.toggleComplete(${todo.id})">
                        ${todo.completed ? '완료취소' : '완료'}
                    </button>
                    <button class="edit-btn" onclick="todoApp.editTodo(${todo.id})">수정</button>
                    <button class="delete-btn" onclick="todoApp.deleteTodo(${todo.id})">삭제</button>
                </div>
            `;
            
            todoList.appendChild(todoItem);
        });
    }

    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // 달력 헤더 업데이트
        document.getElementById('currentMonth').textContent = `${year}년 ${month + 1}월`;
        
        const calendarGrid = document.getElementById('calendarGrid');
        calendarGrid.innerHTML = '';
        
        // 요일 헤더
        const dayHeaders = ['일', '월', '화', '수', '목', '금', '토'];
        dayHeaders.forEach(day => {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day calendar-day-header';
            dayElement.textContent = day;
            calendarGrid.appendChild(dayElement);
        });
        
        // 이번 달의 첫 번째 날과 마지막 날
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        // 달력 생성
        for (let i = 0; i < 42; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            
            const dateString = currentDate.toISOString().split('T')[0];
            
            // 날짜 번호 표시
            const dayNumber = document.createElement('div');
            dayNumber.className = 'calendar-day-number';
            dayNumber.textContent = currentDate.getDate();
            dayElement.appendChild(dayNumber);
            
            // 다른 달의 날짜
            if (currentDate.getMonth() !== month) {
                dayElement.classList.add('other-month');
            }
            
            // 해당 날짜의 할 일들 표시
            const todosForDay = this.todos.filter(todo => todo.date === dateString);
            const maxTodosToShow = 3; // 최대 3개까지만 표시
            
            todosForDay.slice(0, maxTodosToShow).forEach(todo => {
                const todoElement = document.createElement('div');
                todoElement.className = `calendar-todo-item ${todo.completed ? 'completed' : ''}`;
                todoElement.textContent = todo.text;
                todoElement.title = todo.text; // 전체 텍스트를 툴팁으로 표시
                dayElement.appendChild(todoElement);
            });
            
            // 더 많은 할 일이 있으면 표시
            if (todosForDay.length > maxTodosToShow) {
                const moreElement = document.createElement('div');
                moreElement.className = 'calendar-todo-more';
                moreElement.textContent = `+${todosForDay.length - maxTodosToShow}개 더`;
                dayElement.appendChild(moreElement);
            }
            
            // 선택된 날짜
            if (this.selectedDate === dateString) {
                dayElement.classList.add('selected');
            }
            
            // 클릭 이벤트
            dayElement.addEventListener('click', () => {
                this.selectDate(dateString);
            });
            
            calendarGrid.appendChild(dayElement);
        }
        
        // 선택된 날짜의 할 일 표시
        this.renderSelectedDateTodos();
    }

    selectDate(dateString) {
        this.selectedDate = dateString;
        this.renderCalendar();
    }

    renderSelectedDateTodos() {
        const selectedDateTodos = document.getElementById('selectedDateTodos');
        
        if (!this.selectedDate) {
            selectedDateTodos.innerHTML = '<p style="text-align: center; color: #636e72;">날짜를 클릭하면 해당 날짜의 상세 할 일을 볼 수 있습니다.</p>';
            return;
        }
        
        const todosForDate = this.todos.filter(todo => todo.date === this.selectedDate);
        const formattedDate = this.formatDate(this.selectedDate);
        
        selectedDateTodos.innerHTML = `<h3>${formattedDate} 상세 할 일</h3>`;
        
        if (todosForDate.length === 0) {
            selectedDateTodos.innerHTML += '<p style="color: #636e72;">이 날짜에는 할 일이 없습니다.</p>';
            return;
        }
        
        todosForDate.forEach(todo => {
            const todoElement = document.createElement('div');
            todoElement.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            todoElement.style.marginBottom = '10px';
            
            todoElement.innerHTML = `
                <div class="todo-content">
                    <div class="todo-text">${todo.text}</div>
                </div>
                <div class="todo-actions">
                    <button class="complete-btn" onclick="todoApp.toggleComplete(${todo.id})">
                        ${todo.completed ? '완료취소' : '완료'}
                    </button>
                    <button class="edit-btn" onclick="todoApp.editTodo(${todo.id})">수정</button>
                    <button class="delete-btn" onclick="todoApp.deleteTodo(${todo.id})">삭제</button>
                </div>
            `;
            
            selectedDateTodos.appendChild(todoElement);
        });
    }

    changeMonth(direction) {
        this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        this.renderCalendar();
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        
        return `${year}년 ${month}월 ${day}일`;
    }

    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    loadTodos() {
        const stored = localStorage.getItem('todos');
        return stored ? JSON.parse(stored) : [];
    }
}

// 앱 초기화
const todoApp = new TodoApp(); 