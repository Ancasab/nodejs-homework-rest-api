import express from "express";
import contactsService from "../../models/contacts.js";
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
    const contacts = await contactsService.listContacts();
    // console.table(contacts);

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
    const contact = await contactsService.getContactById(req.params.id);
    if (!contact) {
      res.status(404);
      throw new Error(`Contact with id: ${id} not found`)
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
    // Validează datele primite
    const { error } = contactSchema.validate(req.body);
    if (error) {
      res.status(400).json({ message: error.details[0].message });
      return;
    }

    const contact = req.body;
    const newContact = await contactsService.addContact(contact);

    res.status(201).json({
      message: `Contact details for ${newContact.name} were successfully added`,
      data: newContact,
    });
  } catch (error) {
    respondWithError(res, error);
  }
});


// router.post('/', async (req, res, next) => {
//   try {
//     const isValid = checkIsContactValid(req.body);

//     if (!isValid) {
//       res.status(400);
//       throw new Error("missing required name field")
//     }
//     const newContact = await contactsService.addContact(req.body);
    
//     res
//       .status(201)
//       .json({message: `Contact details for ${newContact.name} were successfuly added`, data: newContact });
    
//   } catch (error) {
//     respondWithError(res, error);
//   }
  
// })





/* DELETE localhost:3000/api/contacts/:contactId  */
router.delete('/:id', async (req, res, next) => {
  try {
    const removedContact = await contactsService.removeContact(req.params.id);
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
    // Validează datele primite
    const { error } = contactSchema.validate(req.body);
    if (error) {
      res.status(400).json({ message: error.details[0].message });
      return;
    }

    const updatedFields = req.body;
    const contactId = req.params.id;

    const updatedContact = await contactsService.updateContact(updatedFields, contactId);

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




// router.put('/:id', async (req, res, next) => {
//   try {
//     const updatedFields = req.body;
//     const contactId = req.params.id;

//     // Verificăm dacă body-ul este gol sau lipsesc câmpurile valide
//     const isValid = updatedFields?.name || updatedFields?.email || updatedFields?.phone;
//     if (!isValid) {
//       res.status(400).json({ message: "missing fields" });
//       return;
//     }

//     // Apelează funcția updateContact
//     const updatedContact = await contactsService.updateContact(updatedFields, contactId);

//     if (!updatedContact) {
//       res.status(404).json({ message: "Not found" });
//       return;
//     }

//     res.status(200).json({
//       message: `Contact details for ${updatedContact.name} were successfully updated`,
//       data: updatedContact,
//     });
//   } catch (error) {
//     respondWithError(res, error);
//   }
// });



export default router;

/**
 * Handles Errror Cases
 */
function respondWithError(res, error) {
  console.error(error);
  res
    .status(STATUS_CODES.error)
    .json({ message: `${error}`});
}

/**
 * verifica daca noul contact pe care vrem sa il adaugam este valid 
 */
function checkIsContactValid(contact) {
  if (!contact?.name || !contact?.email || !contact?.phone) {
    return false
  }
  return true;
}


