import express from "express";
import contactsController from "../../controller/contactsController.js";
import contactSchema from "../../validators/contactValidator.js";

const router = express.Router()

const STATUS_CODES = {
  success: 200,
  delete: 204,
  error: 500,

}
 
/* GET localhost:3000/api/contacts */
router.get('/', async (req, res, next) => {
  try {
    const contacts = await contactsController.listContacts();
    console.dir(contacts);

    res
      .status(STATUS_CODES.success)
      .json({ message: 'Lista a fost returnata cu succes', data: contacts });
    
  } catch (error) {
    respondWithError(res, error);
  }
  
});

/* GET localhost:3000/api/contacts/:contactId  */
router.get('/:id', async (req, res, next) => {
  try {
    const contact = await contactsController.getContactById(req.params.id);
    if (!contact) {
      res.status(404);
      throw new Error(`Contact with id: ${req.params.id} not found`)
    }
    res
      .status(STATUS_CODES.success)
      .json({ message: 'Contact was successfully found ', data: contact })
    
  } catch (error) {
    respondWithError(res, error);
  }
  
  
})

/* POST localhost:3000/api/contacts/  */
router.post("/", async (req, res, next) => {
  try {

    const { error } = contactSchema.validate(req.body);
    if (error) {
      res.status(400).json({ message: error.details[0].message });
      return;
    }

    const contact = req.body;
    const newContact = await contactsController.addContact(contact);

    res.status(201).json({
      message: `Contact details for ${newContact.name} were successfully added`,
      data: newContact,
    });
  } catch (error) {
    respondWithError(res, error);
  }
});


/* DELETE localhost:3000/api/contacts/:contactId  */
router.delete('/:id', async (req, res, next) => {
  try {
    const removedContact = await contactsController.removeContact(req.params.id);
    if (!removedContact) {
      res
        .status(404)
        .json({ message: "Contact not found" });
      return;
    }

    res
      .status(STATUS_CODES.success)
      .json({ message: "Contact deleted successfully", data: removedContact });
  } catch (error) {
    respondWithError(res, error);
  }
});


/* PUT localhost:3000/api/contacts/:contactId  */
router.put("/:id", async (req, res, next) => {
  try {
  
    const { error } = contactSchema.validate(req.body);
    if (error) {
      res.status(400).json({ message: error.details[0].message });
      return;
    }

    const updatedFields = req.body;
    const contactId = req.params.id;

    const updatedContact = await contactsController.updateContact(contactId, updatedFields);

    if (!updatedContact) {
      res.status(404).json({ message: "Not found" });
      return;
    }

    res.status(200).json({
      message: `Contact details for ${updatedContact.name} have been successfully updated`,
      data: updatedContact,
    });
  } catch (error) {
    respondWithError(res, error);
  }
});

/* PATCH localhost:3000/api/contacts/:contactId/favorite */
router.patch("/:id/favorite", async (req, res, next) => {
  try {
    const { favorite } = req.body;
    
    if (favorite === undefined) {
      res.status(400).json({ message: "missing field favorite" });
      return;
    }

    const contactId = req.params.id;
    const updatedContact = await contactsController.updateStatusContact(contactId, { favorite });

    if (!updatedContact.success) {
      res.status(404).json({ message: "Not found" });
      return;
    }

    res.status(200).json({
      message: `Favorite status for ${updatedContact.data.name} has been successfully updated`,
      data: updatedContact.data,
    });
  } catch (error) {
    respondWithError(res, error);
  }
});



export default router;


function respondWithError(res, error) {
  console.error(error);
  res
    .status(STATUS_CODES.error)
    .json({ message: `${error}`});
}



