const express = require("express");
const morgan = require("morgan");
const app = express();

app.use(express.json()); //json parser middleware
morgan.token("body", (req, res) => JSON.stringify(req.body)); //create a custom :body token
//morgan middleware to log the request object
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

let persons = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];
app.use(express.static("dist"));

app.get("/", (request, response) => {
  response.send("<h1>Hellp</h1>");
});
app.get("/api/persons", (request, response) => {
  response.json(persons);
});
app.get("/api/info", (request, response) => {
  response.send(
    `Phonebook has info for ${persons.length} people  <br> 
        ${new Date()}`
  );
});
app.get("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  const person = persons.find((p) => p.id === id);
  if (person) {
    response.json(person);
  } else {
    response.statusMessage = `person with id: ${id} not found`;
    response.status(404).end();
  }
});
app.delete("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  const personToDel = persons.find((p) => p.id === id);
  persons = persons.filter((p) => p.id != id);
  //   console.log(persons);
  if (personToDel) {
    response.status(204).end();
  } else {
    response.status(404).end();
    response.statusMessage = `person with id: ${id} not found`;
  }
});
const generateId = () => {
  const idsInUse = persons.map((p) => p.id);
  let randId;
  do {
    randId = Math.floor(Math.random() * 1000);
  } while (idsInUse.includes(randId));
  return randId;
};
app.post("/api/persons", (request, response) => {
  const body = request.body;
  const names = persons.map((p) => p.name.toLocaleLowerCase());

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: "person name or number missing!",
    });
  } else if (names.includes(body.name.toLocaleLowerCase())) {
    return response.status(400).json({
      error: `${body.name} already exists in the phone book`,
    });
  }
  const person = {
    id: String(generateId()),
    name: body.name,
    number: body.number,
  };
  persons = persons.concat(person);
  response.json(persons);
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};
app.use(unknownEndpoint);
const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`server running on port ${port}`);
});
