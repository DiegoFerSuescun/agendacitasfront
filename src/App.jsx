import { Calendar, dayjsLocalizer } from 'react-big-calendar';
import "react-big-calendar/lib/css/react-big-calendar.css";
import dayjs from 'dayjs';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { useEffect, useState } from 'react';
import axios from 'axios';

function App(){

  const localizer = dayjsLocalizer(dayjs);
  const [ newEvent, setNewEvent ] = useState({
    title:"",
    start: "",
    end: "",
    name: "",
    phone: "",
    service: "",
    date: "",
    notes: "",
    id: null
  });
  const [ modalOpen, setModalOpen] = useState(false);
  const [ slot, setSlot ] = useState(null);
  const [ startEvent, setStartEvent ] = useState('');
  const [ endtEvent, setEndEvent ] = useState('');
  const [postTimeslots, setPostTimeslots] = useState([]);
  const [dateOptions, setDateOptions] = useState([]);
  const [ edit, setEdit ] = useState(false);
  const [ eventsback, setEventsBack ] = useState([])
  const [events, setEvents] = useState([
    {
      start: dayjs('2024-09-24T14:00:00').toDate(),
      end: dayjs('2024-09-24T16:00:00').toDate(),
      title: "evento 1"
    },
    {
      start: dayjs('2024-09-24T15:00:00').toDate(),
      end: dayjs('2024-09-24T17:30:00').toDate(),
      title: "evento 2"
    },
  ]);

  useEffect(() => {
    const fetchEvents = async () => {

      try {
        const response = await axios('http://localhost:3005/api/events');
        // console.log("ESTE ES MI RESPONSE ", response);
        const formattedEvents = response.data.map(event => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),     
          date: new Date(event.date),
      }));
        setEventsBack(response.data);
        setEvents(formattedEvents)
      } catch (error) {
        console.log("OCURRIO UN ERROR EN EL FETCH DEL BACK ", error);
        
      } 
    };

    fetchEvents();
  },[]);

  useEffect(() => {
  
  if (startEvent) {
    const today = dayjs().startOf('day');
    const filteredTimeslots = timeSlots.filter(time => {
      const timeSlot = today.hour(parseInt(time.split(':')[0])).minute(parseInt(time.split(':')[1]));
      return timeSlot.isAfter(dayjs(today).hour(parseInt(startEvent.split(':')[0])).minute(parseInt(startEvent.split(':')[1])));
    });

    // console.log(filteredTimeslots);
    
    setPostTimeslots(filteredTimeslots);
  } else {
    setPostTimeslots([]);
  }
  },[startEvent])

  const timeSlots = Array.from({length:21}, (_,i) => 
  dayjs().startOf('day').add(8, 'hour').add(i * 30, 'minute').format('HH:mm'));
  
  const services = ['Servicio 1', 'Servicio 2', 'Servicio 3']
  //MANEJADOR PARA LA SELECCION DE UN SLOT

  const handleSlot = (slotInfo) => {   
    setSlot(slotInfo);
    const selected = slotInfo.start? dayjs(slotInfo.start).format('YYYY-MM-DD'): null;    
    const nextdays = Array.from({length: 7}, (_, i) => 
      dayjs(selected).add(i, 'day').format('YYYY-MM-DD')
    );
    setDateOptions(nextdays)
    setNewEvent({
      ...newEvent,
      start: slotInfo?.start,
      end: slotInfo?.end,
      date: selected
    })
    setModalOpen(true);
  };
  
  //MANEJADOR DE EL ENVIO DE EVENTO
  console.log("EVENTSSSSSSSSSS: ", events);
  
  const handlesendEvent = async () => {
    if (!newEvent.title || !startEvent || !endtEvent || !newEvent.name || !newEvent.phone || !newEvent.service || !newEvent.date || !newEvent.notes) {
      alert("por favor debes ingresar todos los campos");
      return;
    }
    const eventDate = dayjs(newEvent.date).startOf('day');
    const updatedEvent = {
      title: newEvent.title,
      start: eventDate
      .set('hour', startEvent.split(':')[0])
      .set('minute', startEvent.split(':')[1])
      .toDate(),
      end: eventDate
      .set('hour', endtEvent.split(':')[0])
      .set('minute', endtEvent.split(':')[1])
      .toDate(),
      name: newEvent.name,
      phone: newEvent.phone,
      service: newEvent.service,
      date: newEvent.date,
      notes: newEvent.notes

    };
    const updatedEventID = {
      title: newEvent.title,
      start: eventDate
      .set('hour', startEvent.split(':')[0])
      .set('minute', startEvent.split(':')[1])
      .toDate(),
      end: eventDate
      .set('hour', endtEvent.split(':')[0])
      .set('minute', endtEvent.split(':')[1])
      .toDate(),
      name: newEvent.name,
      phone: newEvent.phone,
      service: newEvent.service,
      date: newEvent.date,
      notes: newEvent.notes,
      id: newEvent.id
    };

    try {
      if (edit) {
        await axios.put(`http://localhost:3005/api/events/${newEvent.id}`, updatedEvent);
        setEvents(events.map(event => event.id === newEvent.id ? updatedEventID : event));
      } else {
        const response = await axios.post(`http://localhost:3005/api/events`, updatedEvent);
        console.log("ESTE ES RESPONSE ", response);
        const newE = response.data 
        setEvents([...events, updatedEvent]);        
      }
  
      setModalOpen(false);
      resetForm(); 
    } catch (error) {
      console.log("Ocurrio un error en el try catch de posteo o update ", error);
      
    };
  };

  //MANEJADOR PARA ACTUALIZAR UN EVENTO

  const handleEventClick = (event) => {
    // console.log("EVENTTTTTTTTTTTTTTTTTTTTTTTT ", event); 
    setNewEvent({...event, date: dayjs(event.date).format('YYYY-MM-DD')}); // 
    setStartEvent(dayjs(event.start).format('HH:mm'));
    setEndEvent(dayjs(event.end).format('HH:mm'));
    setEdit(true);
    setModalOpen(true); 
  };

  //PARA CERRAR O CANCELAR EL MODAL
  const handleOnCancel = () => {
    setModalOpen(false);
    setNewEvent({ title: "", start: "", end: "", date: "", name:"", phone: "", service: "", notes: "" });
    setEdit(false)
  }

  //PARA ELMINIAR UN EVENTO OJO NO ES BORRADO LOGICO
  const handleDeleteEvent = async (eventInfo) => {
    const idevent = newEvent?.id;
    try {
      await axios.delete(`http://localhost:3005/api/events/${idevent}`);
      setEvents(events.filter(event => event.id !== newEvent.id))
      handleOnCancel();
    } catch (error) {
      console.log("UPPPS AH ocurrido un problema al eliminar el vento");
    } 
  };

  //RESETEAR EL FORMULARIO

  const resetForm = () => {
    setNewEvent({ title: "", start: "", end: "", date: "", name:"", phone: "", service: "", notes: "" , id: null });
    setStartEvent('');
    setEndEvent('');
    setEdit(false);
  };


  return(
    <div style={{height: "95vh", width: "80vw"}}>
      <Calendar 
        localizer={localizer}
        events={events}
        views={["month", "week", "day"]}
        selectable={true} 
        onSelectSlot={handleSlot} 
        onSelectEvent={handleEventClick}
      />

      {/* Modal para agregar */}

      <Dialog open={modalOpen} onClose={() => handleOnCancel()} sx={{ "& .MuiDialog-paper": { width: '40vh', maxWidth: '400px', height: '70vh', minHeight: "70vh" } }}>
        <DialogTitle sx={{ 
            textAlign: 'center',  
            fontWeight: 'bold',   
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            {edit ? 'Edit reservations' : 'Add to reservations'}
          </DialogTitle>
          <DialogContent>
          <hr style={{ border: '1px solid #ccc' }} />
            <TextField
              autoFocus
              margin='dense'
              label='Título'
              fullWidth
              value={newEvent.title}
              onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
              required
            />
            <TextField
              autoFocus
              margin='dense'
              label='Name'
              value={newEvent.name}
              onChange={(e) => setNewEvent({...newEvent, name: e.target.value})}
              required
            />
            <TextField
              autoFocus
              margin='dense'
              label='Phone'
              value={newEvent.phone}
              onChange={(e) => setNewEvent({...newEvent, phone: e.target.value})}
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel id="service-label">Service *</InputLabel>
                <Select 
                  labelId="service-label" // Asigna labelId
                  value={newEvent.service} 
                  onChange={(e) => setNewEvent({ ...newEvent, service: e.target.value})}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 200, 
                        width: 100, 
                      },
                    },
                  }}
                  label="Service *" 
                >
                  {services.map((service) => (
                    <MenuItem key={service} value={service}>
                      {service}
                    </MenuItem>
                  ))}
                </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel id="service-label">Date *</InputLabel>
                <Select 
                  labelId="service-label" // Asigna labelId
                  value={newEvent.date} 
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value})}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 200, 
                        width: 100, 
                      },
                    },
                  }}
                  label="Date *" 
                >
                  {dateOptions.map((date) => (
                    <MenuItem key={date} value={date}>
                      {dayjs(date).format('dddd, D [de] MMMM [de] YYYY')}
                    </MenuItem>
                  ))}
                </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel id="start-time-label">Hora Inicio</InputLabel>
                <Select 
                  labelId="start-time-label" // Asigna labelId
                  value={startEvent} 
                  onChange={(e) => setStartEvent(e.target.value)}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 200, 
                        width: 100, 
                      },
                    },
                  }}
                  label="Hora Inicio" // Esto es para el label flotante
                >
                  {timeSlots.map((time) => (
                    <MenuItem key={time} value={time}>
                      {time}
                    </MenuItem>
                  ))}
                </Select>
            </FormControl>
            <FormControl fullWidth margin="normal" disabled={!startEvent}>
              <InputLabel id="end-time-label">Hora de Fin</InputLabel>
                <Select 
                  labelId="end-time-label" // Asigna labelId
                  value={endtEvent}
                  onChange={(e) => setEndEvent(e.target.value)}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 200, 
                        width: 100, 
                      },
                    },
                  }}
                  label="Hora de Fin" // Esto es para el label flotante
                >
                  {postTimeslots.map((time) => (
                    <MenuItem key={time} value={time}>
                      {time}
                    </MenuItem>
                  ))}
                </Select>
            </FormControl>
            <TextField
              autoFocus
              margin='dense'
              label='Notes *'
              value={newEvent.notes}
              onChange={(e) => setNewEvent({...newEvent, notes: e.target.value})}
              required
            />
            <Button onClick={(e) => handleDeleteEvent(e)}>Deseo cancelar este evento</Button>

          </DialogContent>
          <DialogActions>
            <Button onClick={() => handleOnCancel()}>Cancelar</Button>
            <Button onClick={handlesendEvent}>agregar</Button>
          </DialogActions>
      </Dialog>

    </div>
  )
}

export default App
