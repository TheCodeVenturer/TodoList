const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();
mongoose.connect("mongodb+srv://Niraj_Modi:Modiniraj1034@cluster0.yjistih.mongodb.net/todolistDB", {
  useNewUrlParser: true,
});
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

// let workList = [];
// let items = [];
const itemsSchema = {
  name: String,
};

const listSchema = {
  name: String,
  items: [itemsSchema],
};

const Item = mongoose.model("Item", itemsSchema);

const List = mongoose.model("List", listSchema);

const item1 = new Item({
  name: "Welcome to your todolist",
});
const item2 = new Item({
  name: "Click + button to delete an item",
});
const item3 = new Item({
  name: "click <--- to delete the item",
});

app.get("/", (req, res) => {
  Item.find((err, items) => {
    if (items.length === 0) {
      Item.insertMany([item1, item2, item3], (err) => {
        if (err) console.log(err);
        // else console.log("inertion completed");
      });
      res.redirect("/");
    } else {
      res.render("index", { listTitle: "Today", listItems: items });
    }
  });
});

app.post("/", (req, res) => {
  const newItem = req.body.newItem;
  const listName = req.body.list;
  if (newItem) {
    const item = new Item({
      name: req.body.newItem,
    });
    if (listName === "Today") {
      item.save();
      res.redirect("/");
    } else {
      List.findOne({ name: listName }, (err, foundList) => {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      });
    }
  } else {
    if (listName === "Today") res.redirect("/");
    else res.redirect("/" + listName);
  }
});

app.post("/delete", (req, res) => {
  const checkboxId = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === "Today") {
    Item.findByIdAndRemove(checkboxId, (err) => {
      if (err) console.log(err);
      // else console.log("Succesfully Deleted");
      res.redirect("/");
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkboxId } } },
      (err, foundList) => {
        if (!err) res.redirect("/" + listName);
      }
    );
  }
});

app.get("/:customLstName", async (req, res) => {
  const customListName = _.capitalize(req.params.customLstName);
  const foundList = await List.findOne({ name: customListName });
  if (!foundList) {
    const list = new List({
      name: customListName,
      items: [item1, item2, item3],
    });
    await list.save();
    res.redirect("/" + customListName);
  } else {
    res.render("index", {
      listTitle: customListName,
      listItems: foundList.items,
    });
  }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server Started at localhost 3000");
});
