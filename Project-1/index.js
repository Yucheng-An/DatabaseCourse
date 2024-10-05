const statuses = ["in progress", "completed", "pending"];
const tasks = [
    "Finish the monthly report",
    "Prepare presentation slides",
    "Review code changes",
    "Write documentation",
    "Attend team meeting",
    "Test new feature",
    "Fix bugs from review",
    "Complete project plan",
    "Update client on progress",
    "Conduct code review session",
    "Organize project files",
    "Write user manual",
    "Research new software tools",
    "Implement feedback from team",
    "Optimize performance issues",
    "Update project roadmap",
    "Schedule meeting with client",
    "Create test cases for new feature",
    "Prepare financial report",
    "Submit time-off request",
    "Evaluate team performance",
    "Run software simulations",
    "Implement security patches",
    "Organize team-building event",
    "Prepare meeting agenda",
    "Review technical documentation",
    "Update internal knowledge base",
    "Deploy new software version",
    "Track project milestones",
    "Review legal documents",
    "Analyze user feedback",
    "Check system backups",
    "Prepare budget forecast",
    "Host a training session",
    "Organize feedback from users",
    "Draft a proposal for a new project",
    "Perform database maintenance",
    "Schedule code deployment",
    "Collaborate on project deliverables",
    "Prepare project timeline",
    "Organize marketing materials",
    "Perform system integration tests"
];

function setupIndexedDB(dbName, storeName, callback) {
    let request = indexedDB.open(dbName, 1);
    request.onupgradeneeded = function (event) {
        let db = event.target.result;
        if (!db.objectStoreNames.contains(storeName)) {
            let objectStore = db.createObjectStore(storeName, { keyPath: "id" });
            objectStore.createIndex("id", "id", { unique: true });
        }
    };
    request.onsuccess = function (event) {
        let db = event.target.result;
        callback(db);
    };
    request.onerror = function (event) {
        console.error("Error opening IndexedDB:", event);
    };
}

function add100kObjects(db, storeName, callback) {
    let transaction = db.transaction(storeName, "readonly");
    let objectStore = transaction.objectStore(storeName);
    let countRequest = objectStore.count();
    countRequest.onsuccess = function () {
        if (countRequest.result === 0) {
            let writeTransaction = db.transaction(storeName, "readwrite");
            let writeObjectStore = writeTransaction.objectStore(storeName);
            for (let i = 0; i < 100000; i++) {
                let object = {
                    id: i,
                    task: `${tasks[Math.floor(Math.random() * tasks.length)]}`,
                    status: `${statuses[Math.floor(Math.random() * statuses.length)]}`,
                    dueDate: new Date(Date.now() + Math.floor(Math.random() * 1000000000)).toISOString().split('T')[0]
                };
                writeObjectStore.add(object);
            }
            writeTransaction.oncomplete = function () {
                console.log("100k objects added.");
                callback();
            };
            writeTransaction.onerror = function (event) {
                console.error("Error adding objects:", event);
            };
        } else {
            console.log("Objects already exist, skipping insertion.");
            callback();
        }
    };

    countRequest.onerror = function (event) {
        console.error("Error counting objects:", event);
    };
}

// Function f1: Reading 100k object names
function f1(db, storeName, callback) {
    let transaction = db.transaction(storeName, "readwrite");
    let objectStore = transaction.objectStore(storeName);
    let count = 0;

    let request = objectStore.openCursor();
    request.onsuccess = function (event) {
        let cursor = event.target.result;
        if (cursor) {
            count++;
            cursor.continue();
        } else {
            callback(count);
        }
    };
}

// Function f2: Reading 100k object names using an index
function f2(db, storeName, callback) {
    let transaction = db.transaction(storeName, "readonly");
    let objectStore = transaction.objectStore(storeName);
    let index = objectStore.index("name");
    let count = 0;

    let request = index.openCursor();
    request.onsuccess = function (event) {
        let cursor = event.target.result;
        if (cursor) {
            count++;
            cursor.continue();
        } else {
            callback(count);
        }
    };
}

// Function f3: Reading 100k objects with readonly transaction
function f3(db, storeName, callback) {
    let transaction = db.transaction(storeName, "readonly");
    let objectStore = transaction.objectStore(storeName);
    let count = 0;

    let request = objectStore.openCursor();
    request.onsuccess = function (event) {
        let cursor = event.target.result;
        if (cursor) {
            count++;
            cursor.continue();
        } else {
            callback(count);
        }
    };
}

// Function to measure performance of each operation
function measurePerformance() {
    const dbName = "TestDB";
    const storeName = "TestStore";
    setupIndexedDB(dbName, storeName, function (db) {
        add100kObjects(db, storeName, function () {
            const performanceResults = [];

            // Measure performance of f1
            let start = performance.now();
            f1(db, storeName, function (count) {
                let end = performance.now();
                performanceResults.push({
                    Operation: "f1 (Read 100k objects)",
                    TimeTakenMs: (end - start).toFixed(2)
                });

                // Measure performance of f2
                start = performance.now();
                f2(db, storeName, function (count) {
                    end = performance.now();
                    performanceResults.push({
                        Operation: "f2 (Index read 100k objects)",
                        TimeTakenMs: (end - start).toFixed(2)
                    });

                    // Measure performance of f3
                    start = performance.now();
                    f3(db, storeName, function (count) {
                        end = performance.now();
                        performanceResults.push({
                            Operation: "f3 (Readonly read 100k objects)",
                            TimeTakenMs: (end - start).toFixed(2)
                        });

                        // Display results in table format
                        console.table(performanceResults);
                    });
                });
            });
        });
    });
}

measurePerformance();
