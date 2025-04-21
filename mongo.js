const { response } = require("express");
const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log("Give password, name and phonenumber as argument!");
  process.exit(1);
}
const password = process.argv[2];
const url = `mongodb+srv://wondiradabebekifelew:${password}@cluster0.jqfkdio.mongodb.net/peopleApp?retryWrites=true&w=majority&appName=Cluster0`;
mongoose.set("strictQuery", false);
mongoose.connect(url);

//create a schema
const personSchema = new mongoose.Schema({
  id: String,
  name: String,
  number: String,
});
//create a Person model(collection)
const Person = mongoose.model("Person", personSchema);

//retrive what's in the db
if (process.argv.length == 3) {
  Person.find({}).then((response) => {
    console.log("Phoneboook: ");
    response.forEach((contact) => {
      console.log(`${contact.name}${" "}${contact.number}`);
    });
    mongoose.connection.close();
  });
} else {
  //save data on db
  const person = new Person({
    id: "45",
    name: process.argv[3],
    number: process.argv[4],
  });

  person.save().then((response) => {
    console.log(
      `Added ${response.name} with number ${response.number} to the db`
    );
    mongoose.connection.close();
  });
}
