
import Contact from '../models/contacts.js';


const contactsController = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact,
}

export async function listContacts() {
    console.log('--- List Contacts ---');
    try {
        return Contact.find();

    } catch (error) {
        console.log("There is an error");
        console.error(error);
  }
};



export async function getContactById(contactId) {
console.log(`--- List Contacts by id ${contactId} ---`);
    try {
        return Contact.findById(contactId);
     
    } catch (error) {
      console.log("There is an error");
      console.error(error);
  }
}


export async function addContact(contact) {
    return Contact.create(contact);

}

export async function removeContact(contactId) {
    return Contact.findByIdAndDelete(contactId);
    
}

export async function updateContact(contactId, updatedFields) {
  try {
    const updatedContact = await Contact.findByIdAndUpdate(
      contactId, 
      updatedFields, 
      { new: true, runValidators: true } 
    );

    if (!updatedContact) {
      return { success: false, message: "Contact not found" };
    }

    return { success: true, data: updatedContact };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function updateStatusContact(contactId, updatedFields) {
  try {
      if (!updatedFields || updatedFields.favorite === undefined) {
        return { success: false, message: "missing field favorite" };
    }
      
    const updatedContact = await Contact.findByIdAndUpdate(
      contactId, 
      {favorite: updatedFields.favorite}, 
      { new: true, runValidators: true } 
    );

    if (!updatedContact) {
      return { success: false, message: "Not found" };
    }

    return { success: true, data: updatedContact };
  } catch (error) {
    return { success: false, error: error.message };
  }
}


export default contactsController;
