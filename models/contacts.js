
import fs from 'node:fs/promises';
import { dirname } from 'node:path'; 
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { writeFile } from 'node:fs/promises';



const __dirname = dirname(fileURLToPath(import.meta.url));


const contactsPath = `${__dirname}/contacts.json`;



export async function listContacts() {
    try {
      const contents = await readFile(contactsPath, { encoding: "utf8" });
      const contacts = JSON.parse(contents);
      return contacts;

    } catch (error) {
        console.log("There is an error");
        console.error(error);
  }
};



export async function getContactById(contactId) {
  try {
    const contents = await readFile(contactsPath, { encoding: "utf8" });
    const contacts = JSON.parse(contents);

    const contact = contacts.find((contact) => contact.id === String(contactId));

    if (contact) { 
      return contact;
    }
     
    } catch (error) {
      console.log("There is an error");
      console.error(error);
  }
}


export async function addContact(contact) {
  try {
    const contents = await readFile(contactsPath, { encoding: "utf8" });
    const contacts = JSON.parse(contents);
    const newContactId = randomUUID();
      
    const isValid = contact?.name && contact?.email && contact?.phone;
    if (!isValid) {
      throw new Error('The contact does not have all required parametres'); 
    }

    const newContact = {
        id: newContactId,
        ...contact,
    };
  
    contacts.push(newContact);
    const parsedContact = JSON.stringify(contacts, null, 2);
    await writeFile(contactsPath, parsedContact);


    console.log('The contact has been ceated successfully !');
    return newContact;
    

  } catch (error) {
      console.log("There is an error");
      console.error(error);
  }
}



export async function updateContact(updatedFields, contactId) {
  try {
    const contents = await readFile(contactsPath, { encoding: "utf8" });
    const contacts = JSON.parse(contents);

    
    const contactIndex = contacts.findIndex((contact) => contact.id === contactId);
    if (contactIndex === -1) {
      return null; 
    }

    
    const updatedContact = {
      ...contacts[contactIndex],
      ...updatedFields,
    };
    contacts[contactIndex] = updatedContact;

    
    await writeFile(contactsPath, JSON.stringify(contacts, null, 2));
    return updatedContact; 
  } catch (error) {
    console.error("There is an error", error);
    throw error; 
  }
}


export async function removeContact(contactId) {
  try {
    const contents = await readFile(contactsPath, { encoding: "utf8" });
    const contacts = JSON.parse(contents);


    const contactIndex = contacts.findIndex((contact) => contact.id === String(contactId));
    if (contactIndex === -1) {
      console.log(`Contact with ID ${contactId} does not exist.`);
      return null; 
    }
  
    const removedContact = contacts[contactIndex];

  
    const updatedContacts = contacts.filter((contact) => contact.id !== String(contactId));
    await writeFile(contactsPath, JSON.stringify(updatedContacts, null, 2));

    console.log(`The contact with ID ${contactId} has been removed successfully!`);
    console.table(updatedContacts);

  
    return removedContact;
  } catch (error) {
    console.error("There is an error", error);
    throw error; 
  }
}


const contactsService = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
}

export default contactsService;
