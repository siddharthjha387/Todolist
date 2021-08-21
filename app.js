//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const date = require(__dirname + "/date.js");
const _ = require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(express.static("public"));

//const items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = [];

mongoose.connect('mongodb+srv://Private:Private@cluster0.q3w1k.mongodb.net/todolistDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const itemsSchema = {
  name: String
};
const Item = mongoose.model("Item", itemsSchema);
const coding = new Item({
  name: 'Coding'
});
const eating = new Item({
  name: 'eating'
});
const park = new Item({
  name: 'park'
});
const defaultItems = [coding, eating, park];

const listSchema = {
  name: String,
  items: [itemsSchema]
}
const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {

  Item.find(function (err, founditems) {
    if (founditems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err)
          console.log(err);
        else
          console.log("Successfully inserted default items ");
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: founditems
      });
    }

  });

});



app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const itemNew = new Item({
    name: itemName
  });

  if (listName === "Today") {
    console.log(listName + " Successfully saved");
    itemNew.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, function (err, findList) {
      findList.items.push(itemNew);
      findList.save();
      res.redirect("/" + listName);
    })
  }


});

app.post("/delete", function (req, res) {
  console.log(req.body);
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function (err) {
      if (err)
        console.log(err);
      else {
        console.log("Successfully deleted");
        res.redirect("/");
      }

    });
  } else {
    List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } }, function (err, findList) {
      if (!err) {
        res.redirect("/" + listName);
      }
    })
  }



});

app.get('/:name', function (req, res) {

  const customListname = _.capitalize(req.params.name);
  List.findOne({
    name: customListname
  }, function (err, findList) {
    if (!err && !findList) {

      console.log("Does not exist");
      const list = new List({
        name: customListname,
        items: defaultItems
      });
      list.save();
      res.redirect("/" + customListname);
    } else {
      console.log("exist");
      res.render("list", {
        listTitle: findList.name,
        newListItems: findList.items
      });
    }


  });

})

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(process.env.PORT || 3000, function () {
  console.log("Server started");
});
